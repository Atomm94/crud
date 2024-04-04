import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
import { AccessRight } from '../entity'
import LogController from '../../controller/LogController'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<AccessRight> {
    /**
     * Indicates that this subscriber only listen to Admin events.
     */
    listenTo () {
        return AccessRight
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<AccessRight>) {

    }

    /**
     * Called after entity update.
     */
    async afterUpdate (event: UpdateEvent<AccessRight>) {
        const { entity: New } = event
        if (New) {
            const cache_key = `${New.company}:cg_*:acr_${New.id}:cr_*`
            await LogController.invalidateCache(cache_key)
        }
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<AccessRight>) {

    }
}
