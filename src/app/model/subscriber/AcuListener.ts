import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
// import SendDevice from '../../mqtt/SendDevice'
// import { Company } from '../entity'
import { Acu } from '../entity/Acu'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Acu> {
    /**
     * Indicates that this subscriber only listen to Acu events.
     */
    listenTo () {
        return Acu
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<Acu>) {
        // const data = event.entity
    }

    /**
     * Called before entity update.
     */
    async beforeUpdate (event: UpdateEvent<Acu>) {
        // const { entity: New, databaseEntity: Old } = event

        // if (Old.session_id == null && New.session_id !== Old.session_id) {
        //     const company: any = await Company.findOne({ id: New.company })
        //     const location = `${company.account}`
        //     SendDevice.setPass(location, New.serial_number, New.session_id)
        // }
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<Acu>) {
    }
}
