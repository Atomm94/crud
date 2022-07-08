// import * as _ from 'lodash'
import { DefaultContext } from 'koa'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    if (ctx.user.role && ctx.params && ctx.params.id && ctx.user.role === Number(ctx.params.id)) {
        ctx.allowed = true
    }
    return next()
}
