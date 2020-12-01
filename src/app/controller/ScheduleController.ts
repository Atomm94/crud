import { DefaultContext } from 'koa'
import { Schedule } from '../model/entity/Schedule'
export default class ScheduleController {
    /**
     *
     * @swagger
     *  /schedule:
     *      post:
     *          tags:
     *              - Schedule
     *          summary: Creates a schedule.
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
     *              name: schedule
     *              description: The schedule to create.
     *              schema:
     *                type: object
     *                required:
     *                  - name
     *                  - type
     *                  - settings
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Unlimited 24/7 - Daily
     *                  description:
     *                      type: string
     *                      example: description
     *                  type:
     *                      type: daily | weekly | specific | flexitime | ordinal
     *                      example: daily
     *                  settings:
     *                      type: string
     *                      example: {}
     *          responses:
     *              '201':
     *                  description: A schedule object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await Schedule.addItem(ctx.request.body as Schedule)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /schedule:
     *      put:
     *          tags:
     *              - Schedule
     *          summary: Update a schedule.
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
     *              name: schedule
     *              description: The schedule to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  name:
     *                      type: string
     *                      example: Unlimited 24/7 - Daily
     *                  description:
     *                      type: string
     *                      example: description
     *                  type:
     *                      type: daily | weekly | specific | flexitime | ordinal
     *                      example: daily
     *                  settings:
     *                      type: string
     *                      example: {}
     *          responses:
     *              '201':
     *                  description: A schedule updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await Schedule.updateItem(ctx.request.body as Schedule)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /schedule/{id}:
     *      get:
     *          tags:
     *              - Schedule
     *          summary: Return schedule by ID
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
            ctx.body = await Schedule.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /schedule:
     *      delete:
     *          tags:
     *              - Schedule
     *          summary: Delete a schedule.
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
     *              name: schedule
     *              description: The schedule to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '200':
     *                  description: schedule has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await Schedule.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /schedule:
     *      get:
     *          tags:
     *              - Schedule
     *          summary: Return schedule list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of schedule
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await Schedule.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
