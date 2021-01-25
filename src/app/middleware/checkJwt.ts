// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import * as jwt from 'jsonwebtoken'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
  const whiteList = ['login', 'swagger', 'favicon', 'page/saveFile', 'registration']

  const path = ctx.request.url.split('/')[1]
  const swagger = ctx.request.url.split('/')[1].split('-')[0]

  const token = <string>ctx.request.header.authorization

  if (whiteList.includes(path) || whiteList.includes(swagger)) {
    ctx.allowed = true
    return next()
  }

  if (token !== 'undefined') {
    try {
      const verify = <any>jwt.verify(token, 'jwtSecret')
      if (verify) {
        ctx.user = verify
        if (ctx.user.super) {
          ctx.allowed = true
        }
        return await next()
      }
    } catch (error) {
      ctx.status = error.status || 401
      ctx.body = error
      return ctx.body
    }
  } else {
    ctx.status = 401
    ctx.body = { message: 'TokenExpiredError' }
    return ctx.body
  }
}
