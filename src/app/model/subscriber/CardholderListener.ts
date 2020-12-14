import {
    EntitySubscriberInterface,
    EventSubscriber,
    // UpdateEvent,
    // getManager,
    RemoveEvent
} from 'typeorm'
// import * as Models from '../entity'
import { Cardholder, CarInfo, Limitation } from '../entity'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Cardholder> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return Cardholder
    }

    /**
     * Called after post insertion.
     */

    async afterRemove (event: RemoveEvent<Cardholder>) {
        const data = event.databaseEntity
        Limitation.destroyItem(data.limitation)
        CarInfo.destroyItem(data.car_info)
    }
    }
