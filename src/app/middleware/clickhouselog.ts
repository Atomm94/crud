import { DefaultContext } from 'koa'
import { logger } from '../../../modules/winston/logger'
import { logUserEvents } from '../enums/logUserEvents.enum'
import SendUserLogMessage from '../mqtt/SendUserLogMessage'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const request = ctx.request
    try {
        await next()
        if (ctx.status === 400) {
            logger.error(`${JSON.stringify(ctx.body)}`)
            if (ctx.body.sqlMessage) ctx.body = { message: ctx.body.sqlMessage }
        } else {
            if (ctx.logsData) {
                for (const logData of ctx.logsData) {
                    new SendUserLogMessage((ctx.user.company) ? ctx.user.company : 0, ctx.user, logData.event, logData.target, logData.value)
                }
            } else {
                let target = (ctx.user && ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel
                if (ctx.body?.name) {
                    target += `/${ctx.body.name}`
                } else if (ctx.body.type) {
                    target += `/${ctx.body.type}`
                }

                switch (request.method) {
                    case 'PUT': // update
                        if (ctx.oldData && ctx.user) {
                            new SendUserLogMessage((ctx.user.company) ? ctx.user.company : 0, ctx.user, logUserEvents.CHANGE, target, { new: ctx.body, old: ctx.oldData })
                        }
                        break
                    case 'POST': // create
                        if (ctx.user) {
                            let value = null
                            if (ctx.body.name) {
                                value = { name: ctx.body.name }
                            } else if (ctx.body.type) {
                                value = { type: ctx.body.type }
                            }
                            new SendUserLogMessage((ctx.user.company) ? ctx.user.company : 0, ctx.user, logUserEvents.CREATE, target, value)
                        }
                        break
                    case 'DELETE': // delete
                        if (ctx.user) {
                            new SendUserLogMessage((ctx.user.company) ? ctx.user.company : 0, ctx.user, logUserEvents.DELETE, target, null)
                        }
                        break
                    default:

                        break
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}
