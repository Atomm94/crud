import { AccessControl as RA } from 'role-acl'
import { Role } from '../model/entity/index'
import { logger } from '../../../modules/winston/logger'

export class AccessControl {
    public static ac = new RA()

    public static async GrantAccess () {
        const roles_data: any = await Role.getAllItems({})

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
        Object.keys(permissions).forEach((model: any) => {
            Object.keys(permissions[model].actions).forEach(async (action: string) => {
                if (permissions[model].actions[action] === true) {
                    await this.ac.grant(grant_name)
                        .execute(action).on(model)
                    // console.log('grant', grant_name, model, action)
                }
            })
        })
    }

    public static async deleteGrant (role: string | number) {
        if (typeof role === 'number') role = role.toString()
        if (this.ac.hasRole(role)) {
            await this.ac.removeRoles(role)
        } else {
            logger.warn(`[Grant] delete - role ${role} not found!!`)
        }
    }

    public static async updateGrant (role: string | number, permissions: any) {
        if (typeof role === 'number') role = role.toString()
        if (this.ac.hasRole(role)) {
            await this.deleteGrant(role)
        } else {
            logger.warn(`[Grant] update - role ${role} not found!!`)
        }
        await this.addGrant(role, permissions)
    }
}
