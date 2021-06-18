// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { getObjectDiff } from '../functions/checkDifference'
import MQTTBroker from '../mqtt/mqtt'
import { SendTopics } from '../mqtt/Topics'
import { logger } from '../../../modules/winston/logger'
import { OperatorType } from '../mqtt/Operators'
import { logUserEvents } from '../enums/logUserEvents.enum'

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
                    let value = logData.value
                    let diff
                    if (logData.event === logUserEvents.CHANGE) {
                        diff = getObjectDiff(value.new, value.old)
                        value = diff
                    }
                    if (logData.event !== logUserEvents.CHANGE || (logData.event === logUserEvents.CHANGE && diff && Object.keys(diff).length)) {
                        const dataLog = {
                            operator: OperatorType.USER_LOG,
                            data: {
                                company: (ctx.user.company) ? ctx.user.company : 0,
                                account: ctx.user,
                                account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
                                event: logData.event,
                                target: logData.target,
                                value: value
                            }
                        }
                        MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
                    }
                }
            } else {
                let target = (ctx.user && ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel
                if (ctx.body.name) {
                    target += `/${ctx.body.name}`
                } else if (ctx.body.type) {
                    target += `/${ctx.body.type}`
                }

                switch (request.method) {
                    case 'PUT': // update
                        if (ctx.oldData && ctx.user) {
                            const diff = getObjectDiff(ctx.body, ctx.oldData)
                            if (Object.keys(diff).length) {
                                const dataLog = {
                                    operator: OperatorType.USER_LOG,
                                    data: {
                                        company: (ctx.user.company) ? ctx.user.company : 0,
                                        account: ctx.user,
                                        account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
                                        event: logUserEvents.CHANGE,
                                        target: target,
                                        value: diff
                                    }
                                }
                                MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
                            }
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
                                    event: logUserEvents.CREATE,
                                    target: target,
                                    value: null
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
                                    event: logUserEvents.DELETE,
                                    target: target,
                                    value: null
                                }
                            }
                            MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
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
