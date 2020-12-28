// import * as _ from 'lodash'
import { DefaultContext } from 'koa'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const request = ctx.request

  try {
    await next()
    switch (request.method) {
      case 'PUT': // update
        console.log(request.method, ctx.request.user)

        break
      case 'POST': // create
        console.log(request.method, ctx.request.user)

        break
      case 'DELETE': // delete
        console.log(request.method, ctx.request.user)

        break

      default:

        break
    }
  } catch (error) {
    console.log(error)
  }
}
