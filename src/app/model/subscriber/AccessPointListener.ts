import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent
} from 'typeorm'
import MQTTBroker from '../../mqtt/mqtt'
import { SendTopics } from '../../mqtt/Topics'
// import SendDevice from '../../mqtt/SendDevice'
// import { Company } from '../entity'
import { socketChannels } from '../../enums/socketChannels.enum'
import { AccessPoint } from '../entity'

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<AccessPoint> {
    /**
     * Indicates that this subscriber only listen to Acu events.
     */
    listenTo () {
        return AccessPoint
    }

    /**
     * Called after post insertion.
     */
    async afterInsert (event: InsertEvent<AccessPoint>) {
        const data: any = event.entity

        const modes: any = await AccessPoint.createQueryBuilder('access_point')
            .select('access_point.name')
            .addSelect('access_point.mode')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where('access_point.company', data.company)
            .groupBy('access_point.mode')
            .getRawMany()

        const send_data: any = {
            data: modes,
            topic: SendTopics.MQTT_SOCKET,
            channel: socketChannels.DASHBOARD_ACCESS_POINT_MODES
        }
console.log(4444444, send_data)

        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    /**
     * Called before entity update.
     */

    /**
     * Called after post insertion.
     */
    async afterUpdate (event: UpdateEvent<AccessPoint>) {
        const { entity: New, databaseEntity: Old }: any = event
        if (New.mode !== Old.mode) {
            const modes: any = await AccessPoint.createQueryBuilder('access_point')
                .select('access_point.name')
                .addSelect('access_point.mode')
                .addSelect('COUNT(access_point.id) as acp_qty')
                .where('access_point.company', New.company)
                .groupBy('access_point.mode')
                .getRawMany()

            const send_data: any = {
                data: modes,
                topic: SendTopics.MQTT_SOCKET,
                channel: socketChannels.DASHBOARD_ACCESS_POINT_MODES
            }

            MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
        }
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<AccessPoint>) {
        const data: any = event.entity
        const modes: any = await AccessPoint.createQueryBuilder('access_point')
            .select('access_point.name')
            .addSelect('access_point.mode')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where('access_point.company', data.company)
            .groupBy('access_point.mode')
            .getRawMany()

        const send_data: any = {
            data: modes,
            topic: SendTopics.MQTT_SOCKET,
            channel: socketChannels.DASHBOARD_ACCESS_POINT_MODES
        }

        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }
}
