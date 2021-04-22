// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import * as jwt from 'jsonwebtoken'
import { JwtToken } from '../model/entity/JwtToken'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const whiteList = ['login', 'swagger', 'favicon', 'page/saveFile', 'registration', 'mqttGetRequest', 'mqttPostRequest', 'account/forgotPassword']

    const path = ctx.request.url.split('?')[0].split('/').slice(1).join('/')
    const invite = path.split('/')[1]
    const swagger = ctx.request.url.split('/')[1].split('-')[0]

    const token = <string>ctx.request.header.authorization

    console.log('token', token, typeof token)

    if (whiteList.includes(path) || whiteList.includes(swagger) || ((!token || token === 'undefined') && invite === 'invite')) {
        ctx.allowed = true
        return next()
    }
    if (token !== 'undefined') {
        try {
            const verify = <any>jwt.verify(token, 'jwtSecret')

            if (verify) {
                ctx.user = verify
                const check_jwt_black_list = await JwtToken.findOne({ account: ctx.user.id, token: token, expired: false })
                if (!check_jwt_black_list) {
                    ctx.status = 401
                    ctx.body = { message: 'User Blocked or TokenExpiredError' }
                } else {
                    if (ctx.user.super) {
                        ctx.allowed = true
                    }
                    return await next()
                }
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
