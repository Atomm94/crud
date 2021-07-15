import { BaseClass } from './BaseClass'
import { Acu } from './Acu'
import { AccessPoint } from './AccessPoint'
import { EventLog } from './EventLog'
import { acuStatus } from '../../enums/acuStatus.enum'
import { Cardholder } from './Cardholder'

export class Dashboard extends BaseClass {
    public static async getAll (user: any) {
        const promises = []
        promises.push(Acu.createQueryBuilder('acu')
            .innerJoin('acu.access_points', 'access_point', 'access_point.delete_date is null')
            .select('acu.status')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where(`acu.company = ${user.company}`)
            .groupBy('acu.status')
            .getRawMany())

        promises.push(Acu.createQueryBuilder('acu')
            .select('acu.status')
            .addSelect('COUNT(acu.id) as acu_qty')
            .where(`acu.company = ${user.company}`)
            .groupBy('acu.status')
            .getRawMany())

        promises.push(AccessPoint.createQueryBuilder('access_point')
            .select('access_point.mode')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .where(`access_point.company = ${user.company}`)
            .groupBy('access_point.mode')
            .getRawMany())

        promises.push(AccessPoint.createQueryBuilder('access_point')
            .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
            .where(`access_point.company = ${user.company}`)
            .where(`acu.status = '${acuStatus.ACTIVE}'`)
            .getMany())

        promises.push(EventLog.getEventStatistic(user))
        const [access_point, acu, access_point_modes, all_access_points, events_data]: any = await Promise.all(promises)
        const send_data: any = {

            access_point_status: access_point,
            acus_status: acu,
            access_point_modes: access_point_modes,
            access_points: all_access_points,
            events_statistic: events_data.events_statistic,
            logs: events_data.logs
        }
        return send_data
    }

    public static async getAllAccessPoints (data: any, user: any) {
        let access_points: any = AccessPoint.createQueryBuilder('access_point')
            .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
            .leftJoinAndSelect('access_point.access_point_groups', 'access_point_group', 'access_point_group.delete_date is null')
            .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
            .where(`access_point.company = '${user.company ? user.company : null}'`)

        if (data.page) {
            const take = data.page_items_count ? (data.page_items_count > 10000) ? 10000 : data.page_items_count : 25
            const skip = data.page_items_count && data.page ? (data.page - 1) * data.page_items_count : 0
            access_points = access_points
                .take(take)
                .skip(skip)
            const [result, total] = await access_points.getManyAndCount()

            return {
                data: result,
                count: total
            }
        } else {
            access_points = await access_points.getMany()
            return access_points
        }
    }

    public static async getCardholders (user: any) {
        const cardholders: any = await Cardholder.createQueryBuilder('cardholder')
            .select('cardholder.presense')
            .addSelect('COUNT(cardholder.id) as cardholder_qty')
            .where(`cardholder.company = '${user.company ? user.company : null}'`)
            .groupBy('cardholder.presense')
            .getRawMany()

        return cardholders
    }
}
