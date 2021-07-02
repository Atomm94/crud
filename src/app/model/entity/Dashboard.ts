import { BaseClass } from './BaseClass'
import { Acu } from './Acu'
import { AccessPoint } from './AccessPoint'
import { EventLog } from './EventLog'

export class Dashboard extends BaseClass {
    public static async getAll (user:any) {
        const promises = []
        promises.push(Acu.createQueryBuilder('acu')
            .innerJoin('acu.access_points', 'access_point')
            .select('access_point.name')
            .addSelect('acu.status')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .groupBy('acu.status')
            .getRawMany())

        promises.push(Acu.createQueryBuilder('acu')
            .select('acu.name')
            .addSelect('acu.status')
            .addSelect('COUNT(acu.id) as acu_qty')
            .groupBy('acu.status')
            .getRawMany())

        promises.push(AccessPoint.createQueryBuilder('access_point')
            .select('access_point.name')
            .addSelect('access_point.mode')
            .addSelect('COUNT(access_point.id) as acp_qty')
            .groupBy('access_point.mode')
            .getRawMany())

        promises.push(EventLog.getEventStatistic(user))
        const [access_point, acu, access_point_modes, events_data]:any = await Promise.all(promises)
        const send_data: any = {
            access_point_status: access_point,
            acus_status: acu,
            access_point_modes: access_point_modes,
            events_statistic: events_data.events_statistic,
            logs: events_data.logs
        }
        return send_data
    }

    public static async getAllAccessPoints (data:any) {
        return await AccessPoint.getAllItems(data)
    }
}
