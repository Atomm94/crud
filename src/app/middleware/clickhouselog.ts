// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { getObjectDiff } from '../functions/checkDifference'
import MQTTBroker from '../mqtt/mqtt'
import { SendTopics } from '../mqtt/Topics'
import { logger } from '../../../modules/winston/logger'
import { OperatorType } from '../mqtt/Operators'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const request = ctx.request
    try {
        await next()
        if (ctx.status === 400) {
            logger.error(`${JSON.stringify(ctx.body)}`)
            if (ctx.body.sqlMessage) ctx.body = { message: ctx.body.sqlMessage }
        } else {
            switch (request.method) {
                case 'PUT': // update
                    if (ctx.oldData && ctx.user) {
                        const diff = getObjectDiff(ctx.body, ctx.oldData)
                        const dataLog = {
                            operator: OperatorType.USER_LOG,
                            data: {
                                company: (ctx.user.company) ? ctx.user.company : 0,
                                account: ctx.user,
                                account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
                                event: 'change',
                                target: (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel,
                                value: diff
                            }
                        }
                        MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
                    }
                    break
                case 'POST': // create
                    if (ctx.user) {
                        const dataLog = {
                            operator: OperatorType.USER_LOG,
                            data: {
                                company: (ctx.user.company) ? ctx.user.company : 0,
                                account: ctx.user,
                                account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
                                event: 'create',
                                target: (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel,
                                value: ctx.body
                            }

                        }
                        MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
                    }
                    break
                case 'DELETE': // delete
                    if (ctx.user) {
                        const dataLog = {
                            operator: OperatorType.USER_LOG,
                            data: {
                                company: (ctx.user.company) ? ctx.user.company : 0,
                                account: ctx.user,
                                account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
                                event: 'delete',
                                target: (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel,
                                value: ctx.request.body.id
                            }
                        }
                        MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
                    }
                    break
                default:

                    break
            }
        }
    } catch (error) {
        console.log(error)
    }
}
