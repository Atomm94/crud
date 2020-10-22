// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
// import { getRepository } from 'typeorm';
import { Role } from '../model/entity/index'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    let permissions: any

    let path = ctx.request.url.split('/')[1]
    const swagger = ctx.request.url.split('/')[1].split('-')[0]

    const method1 = ctx.request.method

    const method = method1 === 'PUT' ? 'update' : method1 === 'POST' ? 'create' : method1 === 'DELETE' ? 'delete' : 'read'

    if (path === 'login' || path === 'changeMyPass' || path === 'myProfile' || method === 'read' || swagger === 'swagger' || swagger === 'favicon' || path === 'getUserData') {
        return next()
    }

    const roleId = ctx.user.role

    try {
        const role = await Role.findOneOrFail({
            select: ['id', 'slug', 'permissions'],
            where: {
                id: roleId
            }
        })
        if (role && role.permissions) {
            if (role.permissions.super) {
                return next()
            }

            if (path === 'changePass') {
                path = 'users'
            }

            permissions = role.permissions[path]
            if (permissions[method] === true) {
                return next()
            } else {
                return (ctx.body = {
                    statusCode: 403,
                    message: 'Permission denied'
                })
            }
        }
        return next()
    } catch (error) {
        ctx.status = error.status || 400
        ctx.body = error
    }
    return ctx.body
}
