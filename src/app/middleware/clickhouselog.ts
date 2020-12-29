// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { getObjectDiff } from '../functions/checkDifference'
import MQTTBroker from '../mqtt/mqtt'
import { TopicCodes } from '../mqtt/Topics'
export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const request = ctx.request
  MQTTBroker.subscribe(TopicCodes.USER_LOG)

  try {
    await next()
    switch (request.method) {
      case 'PUT': // update
        if (ctx.oldData && ctx.user) {
          const diff = getObjectDiff(ctx.body, ctx.oldData)
          const dataLog = {
            account: ctx.user.id,
            account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
            event: 'change',
            target: (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel,
            value: diff,
            company: (ctx.user.company) ? ctx.user.company : null
          }
          MQTTBroker.publishMessage(TopicCodes.USER_LOG, JSON.stringify(dataLog))
        }
        break
      case 'POST': // create
        if (ctx.user) {
          const dataLog = {
            account: ctx.user.id,
            account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
            event: 'create',
            target: (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel,
            value: null,
            company: (ctx.user.company) ? ctx.user.company : null
          }
          MQTTBroker.publishMessage(TopicCodes.USER_LOG, JSON.stringify(dataLog))
        }
        break
      case 'DELETE': // delete
        if (ctx.user) {
          const dataLog = {
            account: ctx.user.id,
            account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
            event: 'delete',
            target: (ctx.user.company && ctx.actionFeature) ? ctx.actionFeature : ctx.actionModel,
            value: ctx.request.body.id,
            company: (ctx.user.company) ? ctx.user.company : null
          }
          MQTTBroker.publishMessage(TopicCodes.USER_LOG, JSON.stringify(dataLog))
        }
        break
      default:

        break
    }
  } catch (error) {
    console.log(error)
  }
}
