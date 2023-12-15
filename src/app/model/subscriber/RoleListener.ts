import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
import { Role } from '../entity/Role'
import { AccessControl } from '../../functions/access-control'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Role> {
    /**
     * Indicates that this subscriber only listen to Role events.
     */
    listenTo () {
        return Role
    }

    /**
     * Called after post insertion.
     */
    afterInsert (event: InsertEvent<Role>) {
        const data = event.entity
        if (data.status && data.permissions) {
            AccessControl.addGrant(data.id, data.permissions)
        }
    }

    /**
     * Called after entity update.
     */
    afterUpdate (event: UpdateEvent<Role>) {
        const { entity: New, databaseEntity: Old } = event
        if (New) {
            if (New.status === Old.status) {
                if (New.status === true) {
                    if (JSON.stringify(New.permissions) !== JSON.stringify(Old.permissions)) {
                        AccessControl.updateGrant(New.id, New.permissions)
                    }
                }
            } else if (New.status === true) {
                AccessControl.addGrant(New.id, New.permissions)
            } else if (New.status === false) {
                AccessControl.deleteGrant(New.id)
            }
        }
    }

    /**
     * Called after entity removal.
     */
    afterRemove (event: RemoveEvent<Role>) {
        if (event.databaseEntity.status) {
            AccessControl.deleteGrant(event.databaseEntity.id)
        }
    }
}
