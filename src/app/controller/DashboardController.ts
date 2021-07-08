import { DefaultContext } from 'koa'
import { Dashboard } from '../model/entity'
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
            req_data.relations = ['acus']
            ctx.body = await Dashboard.getAllAccessPoints(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
