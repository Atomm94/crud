import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent
    // UpdateEvent
} from 'typeorm'
import { CompanyResources } from '../entity'
import { Company } from '../entity/Company'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Company> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return Company
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<Company>) {
        const data = event.entity
        const newCompanyResource = {
            company: data.id,
            used: '{}'
        }
        CompanyResources.addItem(newCompanyResource as CompanyResources)
    }
}
