// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import * as jwt from 'jsonwebtoken'
import { JwtToken } from '../model/entity/JwtToken'
import { Company } from '../model/entity'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const whiteList = [
        'login',
        'swagger',
        'favicon',
        'page/saveFile',
        'registration',
        'mqttGetRequest',
        'mqttPostRequest',
        'account/forgotPassword',
        // 'credential/login',
        // 'credential/accessPoints',
        // 'credential/accessPoint/open'
        // 'guest/credential'
        'zoho/code',
        'zoho/callback',
        'sign-up'
    ]

    const path = ctx.request.url.split('?')[0].split('/').slice(1).join('/')
    const swagger = ctx.request.url.split('/')[1].split('-')[0]
    const invite = path.split('/')[1]

    const token = <string>ctx.request.header.authorization

    if (whiteList.includes(path) || whiteList.includes(swagger) || ((!token || token === 'undefined') && invite === 'invite') ||
        path.split('/').slice(0, -1).join('/') === 'credential/login' ||
        path.split('/').slice(0, -1).join('/') === 'credential/accessPoints' ||
        path.split('/').slice(0, -1).join('/') === 'credential/accessPoint/open' ||
        path.split('/').slice(0, -1).join('/') === 'guest/credential'
    ) {
        ctx.allowed = true
        return next()
    }
    if (token !== 'undefined') {
        try {
            const verify = <any>jwt.verify(token, 'jwtSecret')

            if (verify) {
                ctx.user = verify
                // const check_jwt_black_list = await JwtToken.findOne({ where: { account: ctx.user.id, token: token, expired: false } })
                const check_jwt_black_list = await JwtToken.createQueryBuilder('jwt_token')
                    .where('jwt_token.account = :account', { account: ctx.user.id })
                    .andWhere('jwt_token.token = :token', { token: token })
                    .andWhere('jwt_token.expired = :expired', { expired: false })
                    .cache(`jwt:${token}`, 24 * 60 * 60 * 1000)
                    .getOne()

                if (!check_jwt_black_list) {
                    ctx.status = 401
                    ctx.body = { message: 'User Blocked or TokenExpiredError' }
                } else {
                    if (ctx.user.super) {
                        ctx.allowed = true
                    }
                    if (ctx.user.company) {
                        // let company: any = await Company.findOne({ where: { id: ctx.user.company }, relations: ['packages'] })
                        let company = await Company.createQueryBuilder('company')
                            .leftJoinAndSelect('company.packages', 'package')
                            .where(`company.id = ${ctx.user.company}`)
                            .andWhere('company.delete_date is null')
                            .withDeleted()
                            .cache(`company:package:${ctx.user.company}`, 24 * 60 * 60 * 1000)
                            .getOne()

                        if (company) {
                            if (company.partition_parent_id) {
                                // company = await Company.findOne({ where: { id: company.partition_parent_id }, relations: ['packages'] })
                                company = await Company.createQueryBuilder('company')
                                    .leftJoinAndSelect('company.packages', 'package')
                                    .where(`company.id = ${company.partition_parent_id}`)
                                    .andWhere('company.delete_date is null')
                                    .withDeleted()
                                    .cache(`company:package:${ctx.user.company}`, 168 * 60 * 60 * 1000)
                                    .getOne()
                            }
                            if (company && company.packages) {
                                ctx.query = {
                                    ...ctx.query,
                                    packageExtraSettings: JSON.parse(company.packages.extra_settings)
                                }
                            }
                        }
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
