import {
    EntitySubscriberInterface,
    EventSubscriber,
    // UpdateEvent,
    // getManager,
    RemoveEvent
} from 'typeorm'
// import * as Models from '../entity'
import { User, CarInfo, Limitation } from '../entity'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<User> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return User
    }

    /**
     * Called after post insertion.
     */

    async afterRemove (event: RemoveEvent<User>) {
        const data = event.databaseEntity
        Limitation.destroyItem(data.limitation)
        CarInfo.destroyItem(data.car_info)
    }
    }
