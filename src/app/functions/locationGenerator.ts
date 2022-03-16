
import { Company } from '../model/entity/Company'
export async function locationGenerator (ctx_user:any) {
    let location
    if (ctx_user.companyData && ctx_user.companyData.partition_parent_id) {
        const parent_company = await Company.findOneOrFail({ where: { id: ctx_user.companyData.partition_parent_id } })
        location = `${parent_company.account}/${parent_company.id}`
    } else {
        location = `${ctx_user.company_main}/${ctx_user.company}`
    }
    return location
}
