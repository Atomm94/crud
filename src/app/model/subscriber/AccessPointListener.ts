import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent
} from 'typeorm'
// import SendDevice from '../../mqtt/SendDevice'
// import { Company } from '../entity'
import { socketChannels } from '../../enums/socketChannels.enum'
import { AccessPoint, Acu } from '../entity'
import SendSocketMessage from '../../mqtt/SendSocketMessage'
import { acuStatus } from '../../enums/acuStatus.enum'
import { AccessPointStatus } from '../entity/AccessPointStatus'
import LogController from '../../controller/LogController'

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
            .where(`access_point.company = ${data.company}`)
            .groupBy('access_point.mode')
            .getRawMany()

        new SendSocketMessage(socketChannels.DASHBOARD_ACCESS_POINT_MODES, modes, data.company)

        const acu: any = await Acu.findOne({ where: { id: data.acu } })
        if ([acuStatus.ACTIVE, acuStatus.PENDING].includes(acu.status)) {
            await AccessPointStatus.addItem({ ...data, access_point: data.id })
            const cloud_status_data = {
                id: data.id,
                acus: {
                    id: acu.id,
                    cloud_status: acu.cloud_status
                }

            }
            new SendSocketMessage(socketChannels.DASHBOARD_CLOUD_STATUS, cloud_status_data, data.company)
        }
    }

    /**
     * Called before entity update.
     */

    /**
     * Called after post insertion.
     */
    async afterUpdate (event: UpdateEvent<AccessPoint>) {
        const { entity: New, databaseEntity: Old }: any = event
        if (New.name !== Old.name) {
            const cache_key = `${New.company}:ap_${New.id}`
            await LogController.invalidateCache(cache_key)
        }

        if (New.mode !== Old.mode) {
            const modes: any = await AccessPoint.createQueryBuilder('access_point')
                .select('access_point.name')
                .addSelect('access_point.mode')
                .addSelect('COUNT(access_point.id) as acp_qty')
                .where(`access_point.company = ${New.company}`)
                .groupBy('access_point.mode')
                .getRawMany()

            new SendSocketMessage(socketChannels.DASHBOARD_ACCESS_POINT_MODES, modes, New.company)
        }

        if (New.door_state !== Old.door_state) {
            const sended_door_state = {
                id: New.id,
                door_state: New.door_state
            }
            new SendSocketMessage(socketChannels.DASHBOARD_DOOR_STATE, sended_door_state, New.company)
        }

        if (New.resources !== Old.resources) {
            const acu: any = await Acu.findOne({ where: { id: New.acu, status: acuStatus.ACTIVE } })
            if (acu) {
                await AccessPointStatus.updateItem({
                    access_point: New.id,
                    resources: New.resources
                } as AccessPointStatus)
            }
        }
    }

    /**
     * Called after entity removal.
     */
    async afterRemove (event: RemoveEvent<AccessPoint>) {
        // const data: any = event.entity
        // const modes: any = await AccessPoint.createQueryBuilder('access_point')
        //     .select('access_point.name')
        //     .addSelect('access_point.mode')
        //     .addSelect('COUNT(access_point.id) as acp_qty')
        //     .where(`access_point.company = ${data.company}`)
        //     .groupBy('access_point.mode')
        //     .getRawMany()

        // new SendSocketMessage(socketChannels.DASHBOARD_ACCESS_POINT_MODES, modes, data.company)
    }
}
