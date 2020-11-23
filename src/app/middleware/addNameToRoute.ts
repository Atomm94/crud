// import * as _ from 'lodash'
import { DefaultContext } from 'koa'

function search (path: string, method: string, router: [any]) {
  return router.find(item => `/${item.path.split('/')[1]}` === path && item.methods.includes(method))
}
export default (router: any) => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const path = ctx.request.url.split('/')[1]
  const method = ctx.request.method
  const rt = search(`/${path}`, method, router.stack)
  ctx.allowed = false
  if (rt && rt.name) {
    const route_args = rt.name.split('-')
    if (route_args.length === 3) {
      ctx.actionModel = route_args[0]
      ctx.actionFeature = route_args[1]
      ctx.actionName = route_args[2]
    } else {
      ctx.actionModel = route_args[0]
      ctx.actionName = route_args[1]
    }
  }
  await next()
}
