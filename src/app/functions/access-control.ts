import { AccessControl as RA } from 'role-acl'
import { Package, Role } from '../model/entity/index'
import { logger } from '../../../modules/winston/logger'

export class AccessControl {
    public static ac = new RA()

    public static async GrantAccess () {
        const roles_data: any = await Role.find({ where: { status: true } })
        roles_data.forEach(async (role_data: any) => {
            const grant_name = role_data.id.toString()
            if (role_data.permissions) {
                this.addGrant(grant_name, role_data.permissions)
            }
        })
    }

    public static async canAccess (role: string | number, model: string, action: string) {
        if (typeof role === 'number') role = role.toString()
        if (this.ac.hasRole(role)) {
            const permission = await this.ac.can(role).execute(action).on(model)
            return permission.granted
        } else {
            logger.warn(`[Grant] canAccess - role ${role} not found!!`)
            return false
        }
    }

    public static async addGrant (role: string | number, permissions: any) {
        const grant_name = (typeof role === 'number') ? role.toString() : role
        if (this.ac.hasRole(grant_name)) {
            logger.warn(`[Grant] add - role ${grant_name} exists!!`)
            this.deleteGrant(grant_name)
        }
        permissions = JSON.parse(permissions)
        Object.keys(permissions).forEach((model: any) => {
            if (permissions[model].actions) {
                Object.keys(permissions[model].actions).forEach(async (action: string) => {
                    if (permissions[model].actions[action] === true) {
                        await this.ac.grant(grant_name)
                            .execute(action).on(model)
                        // console.log('grant', grant_name, model, action)
                        // logger.info(`[Grant] add - role ${grant_name}, ${model}, ${action} was executed`)
                    }
                })
            }
        })
    }

    public static async deleteGrant (role: string | number) {
        if (typeof role === 'number') role = role.toString()
        if (this.ac.hasRole(role)) {
            await this.ac.removeRoles(role)
            logger.info(`[Grant] delete - role ${role} was removed`)
        } else {
            logger.warn(`[Grant] delete - role ${role} not found!!`)
        }
    }

    public static async updateGrant (role: string | number, permissions: any) {
        if (typeof role === 'number') role = role.toString()
        if (this.ac.hasRole(role)) {
            await this.deleteGrant(role)
            await this.addGrant(role, permissions)
            logger.info(`[Grant] update - role ${role} was updated`)
        } else {
            await this.addGrant(role, permissions)
            logger.warn(`[Grant] update - role ${role} not found!!`)
        }
    }

    public static async GrantCompanyAccess () {
        const packages: any = await Package.createQueryBuilder('package')
            .withDeleted()
            .getMany()
        this.ac.registerConditionFunction('limit', this.limitCheck)
        if (packages) {
            packages.forEach((package_data: Package) => {
                this.addCompanyGrant(package_data)
            })
        }
    }

    public static async companyCanAccessResource (package_id: number, resource_name: string, used: number) {
        const permission1 = await this.ac
            .can(`package${package_id}`)
            .context({ used: used })
            .execute('addItem')
            .on(resource_name)
        return permission1.granted
    }

    public static async companyCanAccess (package_id: number, action: string) {
        const permission1 = await this.ac.can(`package${package_id}`).execute(action).on('features')
        return permission1.granted
    }

    public static async addCompanyGrant (package_data: Package) {
        if (package_data.extra_settings) {
            const package_id = package_data.id
            const extra_settings: {
                features: { [key: string]: boolean },
                resources: { [key: string]: number },
                package_types: { [key: string]: number }
            } = JSON.parse(package_data.extra_settings)
            if (extra_settings.resources) {
                Object.keys(extra_settings.resources).forEach(resource => {
                    this.ac.grant(`package${package_id}`)
                        .condition({
                            Fn: 'custom:limit',
                            args: { limit: +extra_settings.resources[resource] }
                        })
                        .execute('addItem').on(resource)
                })
            }
            if (extra_settings.package_types) {
                Object.keys(extra_settings.package_types).forEach(package_type => {
                    this.ac.grant(`package${package_id}`)
                        .condition({
                            Fn: 'custom:limit',
                            args: { limit: +extra_settings.package_types[package_type] }
                        })
                        .execute('addItem').on(`package_type${package_type}`)
                })
            }
            if (extra_settings.features) {
                Object.keys(extra_settings.features).forEach(model => {
                    const modelFeatures: any = extra_settings.features[model]
                    Object.keys(modelFeatures).forEach(feature => {
                        if (modelFeatures[feature]) {
                            this.ac.grant(`package${package_id}`)
                                .execute(feature).on('features')
                        }
                    })
                })
            }
        }
    }

    private static limitCheck = (context: { used: number }, args: { limit: number }) => {
        if (!args || typeof args.limit !== 'number') {
            throw new Error('custom:limitCheck requires "limit" argument')
        }
        return +context.used < args.limit
    }
}
