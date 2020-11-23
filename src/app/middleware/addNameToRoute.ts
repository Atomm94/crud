// import * as _ from 'lodash'
import { DefaultContext } from 'koa'

function search (path: string, method: string, router: [any]) {
  return router.find(item => `/${item.path.split('/')[1]}` === path && item.methods.includes(method))
}
export default (router: any) => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const path = ctx.request.url.split('/')[1].split('?')[0]
  const method = ctx.request.method
  const rt = search(`/${path}`, method, router.stack)
  ctx.allowed = false
  if (rt && rt.name) {
    ctx.actionName = rt.name.split('-')[1]
    ctx.actionModel = rt.name.split('-')[0]
  }
  await next()
}
