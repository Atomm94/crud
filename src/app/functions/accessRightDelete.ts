import { logUserEvents } from '../enums/logUserEvents.enum'
import { AccessRight, AccessRule } from '../model/entity'
import SendUserLogMessage from '../mqtt/SendUserLogMessage'

export async function checkAndDeleteAccessRight (data: any, company: number, user: any) {
    if (data.access_right_delete && data.access_right) {
        const access_rules = await AccessRule.findOne({ where: { access_right: data.access_right } })
        console.log('access_rules', access_rules)
        console.log('data', data)

        if (!access_rules) {
            const access_right = await AccessRight.findOneOrFail({ where: { id: data.access_right } })
            await AccessRight.destroyItem({ id: data.access_right, company: company })
            new SendUserLogMessage(company, user, logUserEvents.DELETE, `${AccessRight.name}/${access_right.name}`, { name: access_right.name })
        }
    }
}
