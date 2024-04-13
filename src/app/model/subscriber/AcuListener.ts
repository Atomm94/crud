import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    RemoveEvent
    // UpdateEvent
} from 'typeorm'
import { SendTopics } from '../../mqtt/Topics'
// import SendDevice from '../../mqtt/SendDevice'
// import { Company } from '../entity'
import { Acu } from '../entity/Acu'
import { socketChannels } from '../../enums/socketChannels.enum'
import SendSocketMessage from '../../mqtt/SendSocketMessage'
import { acuStatus } from '../../enums/acuStatus.enum'
import { AccessPoint, Company } from '../entity'
import CronJob from './../../cron'
import { AccessPointStatus } from '../entity/AccessPointStatus'
import { AcuStatus } from '../entity/AcuStatus'
import LogController from '../../controller/LogController'

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
            .select('acu.status')
            .addSelect('COUNT(acu.id) as acu_qty')
            .where(`acu.company = ${data.company}`)
            .groupBy('acu.status')
            .getRawMany())

        promises.push(Acu.createQueryBuilder('acu')
            .innerJoin('acu.access_points', 'access_point', 'access_point.delete_date is null')
            .select('acu.status')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where(`access_point.company = ${data.company}`)
            .groupBy('acu.status')
            .getRawMany())

        const [acus, access_points]: any = await Promise.all(promises)
        const send_data = {
            acus: acus,
            access_points: access_points

        }
        new SendSocketMessage(socketChannels.DASHBOARD_ACU, send_data, data.company)

        if ([acuStatus.ACTIVE, acuStatus.PENDING].includes(data.status)) {
            const company = await Company.findOne({ where: { id: data.company } })
            const acu_data = { ...data, companies: company }
            CronJob.active_devices[data.id] = acu_data

            await AcuStatus.addItem({ ...data, acu: data.id })
            const access_points: any = await AccessPoint.getAllItems({ where: { acu: data.id } })
            for (const access_point of access_points) {
                await AccessPointStatus.addItem({ ...access_point, access_point: access_point.id })
            }
        }
    }

    /**
     * Called before entity update.
     */

    /**
     * Called after post insertion.
     */
    async afterUpdate (event: UpdateEvent<Acu>) {
        const { entity: New, databaseEntity: Old }: any = event

        const cache_key = `${New.company}:acu_${New.serial_number}`
        await LogController.invalidateCache(cache_key)

        const cache_update_key = `acu:access_point:acu_statuses:readers:${New.company}`
        await LogController.invalidateCache(cache_update_key)

        if (New.status !== Old.status) {
            if (New.status === acuStatus.ACTIVE) {
                const acu_status = await AcuStatus.findOne({ where: { acu: New.id } })
                if (!acu_status) {
                    const company = await Company.findOne({ where: { id: New.company } })
                    const acu_data = { ...New, companies: company }
                    CronJob.active_devices[New.id] = acu_data

                    await AcuStatus.addItem({ ...New, acu: New.id })
                    const access_points: any = await AccessPoint.getAllItems({ where: { acu: New.id } })
                    for (const access_point of access_points) {
                        await AccessPointStatus.addItem({ ...access_point, access_point: access_point.id })
                    }
                }
            } else if (New.status === acuStatus.NO_HARDWARE) {
                await AcuStatus.destroyItem({ acu: New.id })
            }

            New.topic = SendTopics.MQTT_SOCKET
            New.channel = socketChannels.DASHBOARD_ACU
            const promises = []
            promises.push(Acu.createQueryBuilder('acu')
                .select('acu.status')
                .addSelect('COUNT(acu.id) as acu_qty')
                .where(`acu.company = ${New.company}`)
                .groupBy('acu.status')
                .getRawMany())

            promises.push(Acu.createQueryBuilder('acu')
                .innerJoin('acu.access_points', 'access_point', 'access_point.delete_date is null')
                .select('acu.status')
                .addSelect('COUNT(access_point.id) as acp_qty')
                .where(`acu.company = ${New.company}`)
                .groupBy('acu.status')
                .getRawMany())

            const [access_points, acus]: any = await Promise.all(promises)
            const send_data = {
                acus: acus,
                access_points: access_points

            }
            new SendSocketMessage(socketChannels.DASHBOARD_ACU, send_data, New.company)
        }

        if (New.cloud_status !== Old.cloud_status) {
            const access_points: any = await AccessPoint.getAllItems({ where: { acu: { '=': New.id } } })

            for (const access_point of access_points) {
                const sended_data = {
                    id: access_point.id,
                    acus: {
                        id: New.id,
                        cloud_status: New.cloud_status
                    }
                }
                new SendSocketMessage(socketChannels.DASHBOARD_CLOUD_STATUS, sended_data, New.company)
            }
        }
    }

    /**
     * Called before entity update.
     */
    async beforeUpdate (event: UpdateEvent<Acu>) {
        // const { entity: New, databaseEntity: Old } = event

        // if (Old.session_id == null && New.session_id !== Old.session_id) {
        //     const company: any = await Company.findOne({ where: {d: New.company })
        //     const location = `${company.account}`
        //     SendDevice.setPass(location, New.serial_number, New.session_id)
        // }
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<Acu>) {
        // const data: any = event.entity
        // // const acus: any = await Acu.getAllItems({ company: { '=': data.company ? data.company : null } })
        // const promises = []
        // promises.push(Acu.createQueryBuilder('acu')
        //     .select('acu.name')
        //     .addSelect('acu.status')
        //     .addSelect('COUNT(acu.id) as acu_qty')
        //     .where(`acu.company = ${data.company}`)
        //     .groupBy('acu.status')
        //     .getRawMany())

        // promises.push(Acu.createQueryBuilder('acu')
        //     .innerJoin('acu.access_points', 'access_point')
        //     .select('access_point.name')
        //     .addSelect('acu.status')
        //     .addSelect('COUNT(access_point.id) as acp_qty')
        //     .where(`access_point.company = ${data.company}`)
        //     .groupBy('acu.status')
        //     .getRawMany())

        // const [acus, access_points]: any = await Promise.all(promises)
        // const send_data = {
        //     acus: acus,
        //     access_points: access_points

        // }
        // new SendSocketMessage(socketChannels.DASHBOARD_ACU, send_data, data.company)
    }
}
