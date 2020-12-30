import { DefaultContext } from 'koa'
import { getRequest } from '../services/requestUtil'
const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getUserLogsUrl = `${clickhouse_server}/userLog`
const getEventLogsUrl = `${clickhouse_server}/eventLog`

export default class logController {
    /**
     *
     * @swagger
     * /userLogs:
     *      get:
     *          tags:
     *              - Log
     *          summary: Return Logs
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of Logs
     *              '401':
     *                  description: Unauthorized
     */
    public static async getUserLogs (ctx: DefaultContext) {
        try {
            const user = ctx.user
            await getRequest(`${getUserLogsUrl}?company=${user.company ? user.company : 0}&limit=100`) // limit HARDCODE!!
                .then((resolve: string) => {
                    ctx.body = resolve
                })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /eventLog:
     *      get:
     *          tags:
     *              - Log
     *          summary: Return Logs
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of Logs
     *              '401':
     *                  description: Unauthorized
     */
    public static async getEventLogs (ctx: DefaultContext) {
        try {
            const user = ctx.user
            await getRequest(`${getEventLogsUrl}?company=${user.company ? user.company : 0}&limit=100`) // limit HARDCODE!!
                .then((resolve: string) => {
                    ctx.body = resolve
                })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
