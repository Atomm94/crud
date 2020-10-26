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
                Object.keys(role_data.permissions).forEach((model: any) => {
                    Object.keys(role_data.permissions[model].actions).forEach((action: string) => {
                        if (role_data.permissions[model].actions[action] === true) {
                            this.ac.grant(grant_name)
                                .execute(action).on(model)
                            // console.log('grant', grant_name, model, action)
                        }
                    })
                })
            }
        })
    }

    public static async canAccess (role: string | number, model: string, action: string) {
        try {
            if (typeof role === 'number') role = role.toString()
            const permission = await this.ac.can(role).execute(action).on(model)
            return permission.granted
        } catch (error) {
            logger.error(`role ${role} not found in Grant!!`)
            return false
        }
    }
}
