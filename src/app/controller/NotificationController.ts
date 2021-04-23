import { DefaultContext } from 'koa'
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
            const notification: Notification = await Notification.findOneOrFail({ id: req_data.id, company: user.company ? user.company : null })
            if (notification.confirmed) {
                ctx.status = 400
                ctx.body = { message: 'confirmed seted!' }
            } else {
                notification.confirmed = new Date().getTime()
                ctx.body = await notification.save()
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
            req_data.relations = ['access_points']
            ctx.body = await Notification.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
