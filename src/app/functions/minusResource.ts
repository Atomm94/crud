import { resourceKeys } from '../enums/resourceKeys.enum'
import { CompanyResources, Company } from '../model/entity'

import * as Models from '../model/entity/index'

export async function minusResource (resource_name: string, company_id: number) {
    console.log('minusResource resource_name', resource_name)
    console.log('minusResource company_id', company_id)
    const models: any = Models
    if (Object.values(resourceKeys).includes(resource_name as resourceKeys) ||
        (models[resource_name] && models[resource_name].resource)
    ) {
        let company = await Company.findOneOrFail({ where: { id: company_id } })
        if (company.partition_parent_id) {
            company = await Company.findOneOrFail({ where: { id: company.partition_parent_id } })
        }

        const company_resources: any = await CompanyResources.findOne({ company: company.id })
        if (company_resources) {
            console.log('minusResource company_resources', company_resources)
            const used = JSON.parse(company_resources.used)
            if (resource_name in used) {
                used[resource_name]--
            } else {
                used[resource_name] = 0
            }
            console.log('minusResource updated used', JSON.stringify(used))
            company_resources.used = JSON.stringify(used)
            await company_resources.save()
        }
    }
}
