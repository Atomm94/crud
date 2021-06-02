
import { CompanyResources } from '../model/entity'

export async function minusResource (model: string, company: number) {
    const company_resources: any = await CompanyResources.findOne({ company: company })
    if (company_resources) {
        const used = JSON.parse(company_resources.used)
        used[model]--
        company_resources.used = JSON.stringify(used)
        await company_resources.save()
    }
}
