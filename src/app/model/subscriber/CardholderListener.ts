import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    // getManager,
    RemoveEvent
} from 'typeorm'
// import * as Models from '../entity'
import { Cardholder, CarInfo, Limitation } from '../entity'
import { AntipassBack } from '../entity/AntipassBack'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Cardholder> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return Cardholder
    }

    async afterUpdate (event: UpdateEvent<Cardholder>) {
        const { entity: New, databaseEntity: Old } = event
        if (New.limitation_inherited !== Old.limitation_inherited) {
            if (New.limitation_inherited === true) {
                Limitation.destroyItem(Old.limitation)
            }
        }

        if (New.antipass_back_inherited !== Old.antipass_back_inherited) {
            if (New.antipass_back_inherited === true) {
                AntipassBack.destroyItem(Old.antipass_back)
            }
        }
    }
    /**
     * Called after post insertion.
     */

    async afterRemove (event: RemoveEvent<Cardholder>) {
        const data = event.databaseEntity
        if (data.limitation_inherited === false) {
            Limitation.destroyItem(data.limitation)
        }
        if (data.antipass_back_inherited === false) {
            AntipassBack.destroyItem(data.antipass_back)
        }
        CarInfo.destroyItem(data.car_info)
    }
}
