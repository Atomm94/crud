import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    InsertEvent
    // UpdateEvent
} from 'typeorm'
import { AccessControl } from '../../functions/access-control'
import { Packet } from '../entity/Packet'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Packet> {
    /**
     * Indicates that this subscriber only listen to Packet events.
     */
    listenTo () {
        return Packet
    }

    /**
     * Called after entity update.
     */
    async beforeUpdate (event: UpdateEvent<Packet>) {
        const { entity: New, databaseEntity: Old } = event
        if (Old.extra_settings !== New.extra_settings) {
            event.entity = Old
            delete New.id
            try {
                await Packet.addItem(New)
                await Packet.softRemove(await Packet.find({ id: Old.id }))
            } catch (error) {
                throw new Error(error)
            }
        }
    }

    async afterInsert (event: InsertEvent<Packet>) {
        const data = event.entity
        if (data.status && data.extra_settings) {
            AccessControl.addCompanyGrant(data)
        }
    }
}
