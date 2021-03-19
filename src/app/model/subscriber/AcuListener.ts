import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
import MQTTBroker from '../../mqtt/mqtt'
import { SendTopics } from '../../mqtt/Topics'
// import SendDevice from '../../mqtt/SendDevice'
// import { Company } from '../entity'
import { Acu } from '../entity/Acu'
import { socketChannels } from '../../enums/socketChannels.enum'

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
        const data: any = event.entity
        const promises = []
        promises.push(Acu.createQueryBuilder('acu')
            .select('acu.name')
            .addSelect('acu.status')
            .addSelect('COUNT(acu.id) as acu_qty')
            .where('acu.company', data.company)
            .groupBy('acu.status')
            .getRawMany())

        promises.push(Acu.createQueryBuilder('acu')
            .innerJoin('acu.access_points', 'access_point')
            .select('access_point.name')
            .addSelect('acu.status')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where('access_point.company', data.company)
            .groupBy('acu.status')
            .getRawMany())

        const [acus, access_points]: any = await Promise.all(promises)
        const send_data: any = {
            data: {
                acus: acus,
                access_points: access_points

            },
            topic: SendTopics.MQTT_SOCKET,
            channel: socketChannels.DASHBOARD_ACU
        }

        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    /**
     * Called before entity update.
     */

    /**
     * Called after post insertion.
     */
    async afterUpdate (event: UpdateEvent<Acu>) {
        const { entity: New, databaseEntity: Old }: any = event
        if (New.status !== Old.status) {
            New.topic = SendTopics.MQTT_SOCKET
            New.channel = socketChannels.DASHBOARD_ACU
            const promises = []
            promises.push(Acu.createQueryBuilder('acu')
                .select('acu.name')
                .addSelect('acu.status')
                .addSelect('COUNT(acu.id) as acu_qty')
                .where('company', New.company)
                .groupBy('acu.status')
                .getRawMany())

            promises.push(Acu.createQueryBuilder('acu')
                .innerJoin('acu.access_points', 'access_point')
                .select('access_point.name')
                .addSelect('acu.status')
                .addSelect('COUNT(access_point.id) as acp_qty')
                .where('company', New.company)
                .groupBy('acu.status')
                .getRawMany())

            const [access_points, acus]: any = await Promise.all(promises)
            const send_data: any = {
                data: {
                    acus: acus,
                    access_points: access_points

                },
                topic: SendTopics.MQTT_SOCKET,
                channel: socketChannels.DASHBOARD_ACU
            }
            MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
        }
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
        const data: any = event.entity
        // const acus: any = await Acu.getAllItems({ company: { '=': data.company ? data.company : null } })
        const promises = []
        promises.push(Acu.createQueryBuilder('acu')
            .select('acu.name')
            .addSelect('acu.status')
            .addSelect('COUNT(acu.id) as acu_qty')
            .where('acu.company', data.company)
            .groupBy('acu.status')
            .getRawMany())

        promises.push(Acu.createQueryBuilder('acu')
            .innerJoin('acu.access_points', 'access_point')
            .select('access_point.name')
            .addSelect('acu.status')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where('access_point.company', data.company)
            .groupBy('acu.status')
            .getRawMany())

        const [acus, access_points]: any = await Promise.all(promises)
        const send_data: any = {
            data: {
                acus: acus,
                access_points: access_points

            },
            topic: SendTopics.MQTT_SOCKET,
            channel: socketChannels.DASHBOARD_ACU
        }

        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }
}
