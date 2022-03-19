
import { CompanyResources } from '../model/entity'

export async function minusResource (resource_name: string, company: number) {
    console.log('minusResource resource_name', resource_name)
    console.log('minusResource company', company)

    const company_resources: any = await CompanyResources.findOne({ company: company })
    if (company_resources) {
        console.log('minusResource company_resources', company_resources)
        const used = JSON.parse(company_resources.used)
        if (resource_name in used) {
            used[resource_name]--
        } else {
            used[resource_name] = 0
        }
        company_resources.used = JSON.stringify(used)
        await company_resources.save()
    }
}
