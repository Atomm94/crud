import { AccessRight, AccessRule } from '../model/entity'

export async function checkAndDeleteAccessRight (data: any, company: number) {
    if (data.access_right_delete && data.access_right) {
        const access_rules = await AccessRule.findOne({ where: { access_right: data.access_right } })
        console.log('access_rules', access_rules)
        console.log('data', data)

        if (!access_rules) {
            await AccessRight.destroyItem({ id: data.access_right, company: company })
        }
    }
}
