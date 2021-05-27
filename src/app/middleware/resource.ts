// import * as _ from 'lodash'
import * as Model from '../model/entity'
import { logger } from '../../../modules/winston/logger'
import { AccessControl } from '../functions/access-control'
import { DefaultContext } from 'koa'
export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const modelList: any = Model
    if (ctx.user && ctx.user.company && ctx.actionModel && ctx.actionName && ctx.actionName === 'addItem' && modelList[ctx.actionModel] && modelList[ctx.actionModel].resource) {
        const canCreateResource: boolean = await canCreate(ctx.user.company, ctx.actionModel)
        if (canCreateResource) {
            await next()
        } else {
            ctx.status = 403
            ctx.body = { message: `${ctx.actionModel} resource limit has been reached` }
        }
    } else if (ctx.routerName === 'Company-addItem') {
        const reg_token = await Model.RegistrationInvite.findOne({ token: ctx.params.token, used: false })
        if (!reg_token) {
            ctx.status = 400
            ctx.body = {
                message: 'Wrong token!!'
            }
        } else {
            if (reg_token.company) {
                const resource = ctx.request.body.company.package_type
                const canCreateResource: boolean = await canCreate(reg_token.company, resource)
                if (canCreateResource) {
                    await next()
                } else {
                    ctx.status = 403
                    ctx.body = { message: `${!Number(resource) ? resource : ''} resource limit has been reached` }
                }
            } else {
                await next()
            }
        }
    } else {
        await next()
    }
}

async function canCreate (company_id: number, resource: string): Promise<boolean> {
    try {
        const company = await Model.Company.findOneOrFail({ id: company_id })
        if (company && company.package) {
            const companyResources = await Model.CompanyResources.findOneOrFail({ company: company_id })
            if (companyResources && companyResources.used) {
                const usedRes = JSON.parse(companyResources.used)
                const resource_name = Number(resource) ? `package_type${resource}` : resource

                return await AccessControl.companyCanAccessResource(company.package, resource_name, (resource in usedRes) ? +usedRes[resource] : 0)
            }
        }
        return false
    } catch (error) {
        logger.info(error)
        return false
    }
}
