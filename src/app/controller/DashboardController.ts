import { DefaultContext } from 'koa'
import { Dashboard, EventLog } from '../model/entity'
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
            ctx.body = await Dashboard.getAll(user)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
        *
        * @swagger
        * /dashboard/getAllAccessPoints:
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
            ctx.body = await Dashboard.getAllAccessPoints(req_data, user)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
 *
 * @swagger
 * /dashboard/getCardholders:
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
    public static async getCardholders (ctx: DefaultContext) {
        try {
            const user = ctx.user
            ctx.body = await Dashboard.getCardholders(user)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
        *
        * @swagger
        * /dashboard/getDashboardActivity:
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
    public static async getDashboardActivity (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            const events_data: any = await EventLog.get(user, req_data)
            ctx.body = events_data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
