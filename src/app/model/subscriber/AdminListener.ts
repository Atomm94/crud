import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
import { Admin } from '../entity/Admin'
import { CompanyResources } from '../entity/CompanyResources'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Admin> {
    /**
     * Indicates that this subscriber only listen to Admin events.
     */
    listenTo () {
        return Admin
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<Admin>) {
        const data = event.entity
        if (data.company) {
            const company_resources = await CompanyResources.findOne({ company: data.company })
            if (company_resources) {
                const used: any = JSON.parse(company_resources.used)
                if (used.Admin) {
                    used.Admin++
                    company_resources.used = JSON.stringify(used)
                    await company_resources.save()
                }
            }
        }
    }

    /**
     * Called after entity update.
     */
    afterUpdate (event: UpdateEvent<Admin>) {
        // const { entity: New, databaseEntity: Old } = event
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<Admin>) {
        if (event.databaseEntity.company) {
            const company_resources = await CompanyResources.findOne({ company: event.databaseEntity.company })
            if (company_resources) {
                const used: any = JSON.parse(company_resources.used)
                if (used.Admin) {
                    used.Admin--
                    company_resources.used = JSON.stringify(used)
                    await company_resources.save()
                }
            }
        }
    }
}
