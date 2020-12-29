// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { getObjectDiff } from '../functions/checkDifference'
import MQTTBroker from '../mqtt/mqtt'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const request = ctx.request
  console.log('clickhouselog')
  MQTTBroker.client.subscribe('userlog', (err: any) => {
    if (err) console.log('subscribe error', err)
  })
  try {
    await next()
    switch (request.method) {
      case 'PUT': // update
        if (ctx.oldData) {
          const diff = getObjectDiff(ctx.body, ctx.oldData)

          const dataLog = {
            account: ctx.user.id,
            account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
            event: 'update',
            target: ctx.actionName,
            value: diff,
            company: (ctx.user.company) ? ctx.user.company : null
          }

          MQTTBroker.client.publish('userlog', JSON.stringify(dataLog), (error: any) => {
            if (error) console.log('publish error', error)
          })
        }
        break
      case 'POST': // create
        if (ctx.user) {
          const dataLog = {
            account: ctx.user.id,
            account_name: `${ctx.user.first_name} ${ctx.user.last_name}`,
            event: 'create',
            target: ctx.actionName,
            value: null,
            company: (ctx.user.company) ? ctx.user.company : null
          }

          MQTTBroker.client.publish('userlog', JSON.stringify(dataLog), (error: any) => {
            if (error) console.log('publish error', error)
          })
        }

        break
      case 'DELETE': // delete
        console.log(request.method, ctx.user)
        break
      default:

        break
    }
  } catch (error) {
    console.log(error)
  }
}
