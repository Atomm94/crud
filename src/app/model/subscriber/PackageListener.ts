import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    InsertEvent
    // UpdateEvent
} from 'typeorm'
import { AccessControl } from '../../functions/access-control'

import { Package } from '../entity/Package'
import { createPlan } from '../../functions/zoho-utils'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Package> {
    /**
     * Indicates that this subscriber only listen to Package events.
     */
    listenTo () {
        return Package
    }

    /**
     * Called after entity update.
     */
    async beforeUpdate (event: UpdateEvent<Package>) {
        const { entity: New, databaseEntity: Old } = event
        if (New && Old.extra_settings !== New?.extra_settings) {
            event.entity = Old
            delete New.id
            try {
                await Package.addItem(New as Package)
                await Package.softRemove(await Package.find({ where: { id: Old.id } }))
            } catch (error) {
                throw new Error(error)
            }
        }
    }

    async afterInsert (event: InsertEvent<Package>) {
        const data = event.entity
        if (data.status && data.extra_settings) {
            await AccessControl.addCompanyGrant(data)
        }
        createPlan(data)
    }
}
