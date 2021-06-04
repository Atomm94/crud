
import { CompanyResources } from '../model/entity'

export async function minusResource (resource_name: string, company: number) {
    const company_resources: any = await CompanyResources.findOne({ company: company })
    if (company_resources) {
        const used = JSON.parse(company_resources.used)
        used[resource_name]--
        company_resources.used = JSON.stringify(used)
        await company_resources.save()
    }
}
