// import * as _ from 'lodash'
import { DefaultContext } from 'koa'

function search (path: string, method: string, router: [any]) {
  return router.find(item => item.path === path && item.methods.includes(method))
}
export default (router: any) => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const rt = search('/language', 'GET', router.stack)
  ctx.actionName = rt.name
  ctx.actionModel = rt.path.slice(1)
  await next()
}
