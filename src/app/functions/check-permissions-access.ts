import { Role } from '../model/entity/Role'

export async function checkPermissionsAccess (user: any, permissions: any) {
    if (typeof permissions === 'string') permissions = JSON.parse(permissions)
    let check: boolean = true
    if (!(user.super && !user.company)) {
        if (!user.role) {
            check = false
        } else {
            const role: any = await Role.getItem(user.role)
            if (!role) {
                check = false
            } else {
                const user_permissions: any = JSON.parse(role.permissions)
                Object.keys(permissions).forEach(model => {
                    if (!user_permissions[model]) {
                        check = false
                    } else {
                        Object.keys(permissions[model].actions).forEach(action => {
                            if (!(action in user_permissions[model].actions)) {
                                check = false
                            }
                        })
                    }
                })
            }
        }
    }
    return check
}
