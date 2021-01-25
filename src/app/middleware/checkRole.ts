// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
// import { getRepository } from 'typeorm';
// import { Role } from '../model/entity/index'
import { AccessControl } from '../functions/access-control'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const route_args = ctx.routerName.split('-')

    if (route_args.length === 3) {
      ctx.actionModel = route_args[0]
      ctx.actionFeature = route_args[1]
      ctx.actionName = route_args[2]
    } else {
      ctx.actionModel = route_args[0]
      ctx.actionName = route_args[1]
    }
    // const path = ctx.request.url.split('/')[1]
    // const swagger = ctx.request.url.split('/')[1].split('-')[0]

    // const method1 = ctx.request.method

    // const method = method1 === 'PUT' ? 'update' : method1 === 'POST' ? 'create' : method1 === 'DELETE' ? 'delete' : 'read'

    // if (path === 'login' || path === 'changeMyPass' || path === 'myProfile' || method === 'read' || swagger === 'swagger' || swagger === 'favicon' || path === 'getUserData') {
    //     return next()
    // }
    if (ctx.allowed) {
        return next()
    }

    let check = false
    if (ctx.user && ctx.user.role) {
        const roleId = ctx.user.role
        const actionName = ctx.actionName
        const actionModel = (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel
        check = await AccessControl.canAccess(roleId, actionModel, actionName)
    }
    try {
        // console.log('check', check)

        if (check) {
            return next()
        } else {
            ctx.status = 403
            ctx.body = {
                statusCode: 403,
                message: 'Permission denied'
            }
            return ctx
        }
    } catch (error) {
        ctx.status = error.status || 400
        ctx.body = error
    }
    return ctx.body
}
