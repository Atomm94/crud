import { DefaultContext } from 'koa'
import { IsNull } from 'typeorm'
import { Notification } from '../model/entity/Notification'
export default class NotificationController {
    /**
     *
     * @swagger
     *  /notification:
     *      post:
     *          tags:
     *              - Notification
     *          summary: Creates a notification.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *            - in: body
     *              name: notification
     *              description: The notification to create.
     *              schema:
     *                type: object
     *                required:
     *                  - access_point
     *                  - event
     *                properties:
     *                  access_point:
     *                      type: number
     *                  event:
     *                      type: string
     *                  description:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A notification object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            req_data.company = user.company ? user.company : null
            ctx.body = await Notification.addItem(req_data as Notification)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /notification/confirm:
     *      put:
     *          tags:
     *              - Notification
     *          summary: Update a notification.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *            - in: body
     *              name: notification
     *              description: The notification to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '201':
     *                  description: A notification updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async confirm (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null
            if (req_data.id) {
                const notification: Notification = await Notification.findOneOrFail({ where: { id: req_data.id, company: company } })
                if (notification.confirmed) {
                    ctx.status = 400
                    ctx.body = { message: 'confirmed seted!' }
                } else {
                    notification.confirmed = new Date().getTime()
                    ctx.body = await notification.save()
                }
            } else {
                const notifications: Notification[] = await Notification.find({ where: { company: company, confirmed: IsNull() } })
                if (!notifications.length) {
                    // ctx.status = 400
                    ctx.body = { message: 'All notifications are confirmed!' }
                } else {
                    for (const notification of notifications) {
                        notification.confirmed = new Date().getTime()
                        await notification.save()
                    }
                    ctx.body = { success: true }
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /notification/{id}:
     *      get:
     *          tags:
     *              - Notification
     *          summary: Return notification by ID
     *          parameters:
     *              - name: id
     *                in: path
     *                required: true
     *                description: Parameter description
     *                schema:
     *                    type: integer
     *                    format: int64
     *                    minimum: 1
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async get (ctx: DefaultContext) {
        try {
            ctx.body = await Notification.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /notification:
     *      get:
     *          tags:
     *              - Notification
     *          summary: Return notification list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of notification
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            // req_data.relations = ['access_points']
            // req_data.where = { company: { '=': user.company } }
            // ctx.body = await Notification.getAllItems(req_data)
            const take = req_data.page_items_count ? (req_data.page_items_count > 10000) ? 10000 : req_data.page_items_count : 25
            const skip = req_data.page_items_count && req_data.page ? (req_data.page - 1) * req_data.page_items_count : 0

            const result: any = await Notification.createQueryBuilder('notification')
                // .leftJoinAndSelect('notification.access_points', 'access_point')
                .orderBy('notification.createDate', 'DESC')
                .where(`notification.company = '${user.company ? user.company : null}'`)
                .take(take)
                .skip(skip)
                .cache(60000)
                .getMany()

            if (req_data.page) {
                const total = await Notification.createQueryBuilder('notification')
                    .select('COUNT(id) ', 'count')
                    .where(`notification.company = '${user.company ? user.company : null}'`)
                    .cache(60000)
                    .getRawOne()

                ctx.body = {
                    data: result,
                    count: total.count
                }
            } else {
                ctx.body = result
            }
        } catch (error) {
            console.log('error: ', error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
