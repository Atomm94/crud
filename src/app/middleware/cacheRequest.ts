// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { RedisClass } from '../../component/redis'

export default (expire_time?: number) => async (ctx: DefaultContext, next: () => Promise<any>) => {
    try {
        const user = ctx.user
        let company = 0
        if (user) {
            company = user.company
        }
        const key = `${company}_${ctx.request.url}`
        const value = await RedisClass.connection.get(key)
        if (value) {
            return ctx.body = JSON.parse(value)
        } else {
            await next()
            await RedisClass.connection.set(key, ctx.body ? JSON.stringify(ctx.body) : '', 'EX', expire_time || 60)
        }
    } catch (error) {
    }
}
