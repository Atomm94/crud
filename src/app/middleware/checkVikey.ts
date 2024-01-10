// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import * as jwt from 'jsonwebtoken'
import { Credential } from '../model/entity'
import { credentialType } from '../enums/credentialType.enum'

export default (token_required: boolean) => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const token = <string>ctx.request.header.authorization

    if (token && token !== 'undefined') {
        const verify = <any>jwt.verify(token, 'jwtSecret')
        try {
            if (verify) {
                ctx.vikey_data = verify
                if (verify.code !== ctx.params.code) {
                    if (token_required) {
                        ctx.status = 400
                        ctx.body = { message: `Invalid code ${ctx.params.code}!` }
                    } else {
                        delete ctx.vikey_data
                        return await next()
                    }
                } else {
                    const credential = await Credential.findOne({ where: { code: verify.code, type: credentialType.VIKEY, company: verify.company } })
                    if (!credential) {
                        ctx.status = 400
                        ctx.body = { message: `Invalid code ${verify.code}!` }
                    } else {
                        return await next()
                    }
                }
            }
        } catch (error) {
            ctx.status = error.status || 401
            ctx.body = error
            return ctx.body
        }
    } else if (token_required) {
        ctx.status = 403
        ctx.body = { message: 'permission denied!' }
    } else {
        return await next()
    }
}
