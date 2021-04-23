import { DefaultContext } from 'koa'
import { AccessPoint, Acu, EventLog } from '../model/entity'
// import { acuStatus } from '../enums/acuStatus.enum'
// import { Dashboard } from '../model/entity/Dashboard'

export default class DashboardController {
    /**
     *
     * @swagger
     * /Dashboard:
     *      get:
     *          tags:
     *              - Dashboard
     *          summary: Return Dashboard list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of Dashboard
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const user = ctx.user
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
            ctx.body = send_data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
        *
        * @swagger
        * /Dashboard/getAllAccessPoints:
        *      get:
        *          tags:
        *              - Dashboard
        *          summary: Return AccessPoints list
        *          parameters:
        *              - in: header
        *                name: Authorization
        *                required: true
        *                description: Authentication token
        *                schema:
        *                    type: string
        *          responses:
        *              '200':
        *                  description: Array of AccessPoints
        *              '401':
        *                  description: Unauthorized
        */
    public static async getAllAccessPoints (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await AccessPoint.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
