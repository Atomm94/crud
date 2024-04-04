import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
import { RedisClass } from '../../../component/redis'
import { CameraSet } from '../entity/CameraSet'
// import { AccessPoint } from '../entity'
// import LogController from '../../controller/LogController'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<CameraSet> {
    /**
     * Indicates that this subscriber only listen to CameraSet events.
     */
    listenTo () {
        return CameraSet
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<CameraSet>) {

    }

    /**
     * Called before entity update.
     */

    /**
     * Called after post insertion.
     */
    async afterUpdate (event: UpdateEvent<CameraSet>) {
        const { entity: New }: any = event
        const cache_key = `${New.company}:acp_${New.access_point}`
        const cached_apis = await RedisClass.connection.keys(cache_key)
        for (const cached_api of cached_apis) {
            await RedisClass.connection.del(cached_api)
        }
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<CameraSet>) {

    }
}
