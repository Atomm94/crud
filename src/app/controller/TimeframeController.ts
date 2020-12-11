import { DefaultContext } from 'koa'
import { Timeframe } from '../model/entity/Timeframe'
export default class TimeframeController {
    /**
     *
     * @swagger
     *  /timeframe:
     *      post:
     *          tags:
     *              - Schedule
     *          summary: Creates a timeframe.
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
     *              name: timeframe
     *              description: The timeframe to create.
     *              schema:
     *                type: object
     *                required:
     *                  - name
     *                  - start
     *                  - end
     *                  - schedule
     *                properties:
     *                  name:
     *                      type: string
     *                      example: sun
     *                  start:
     *                      type: string
     *                      example: 08:00
     *                  end:
     *                      type: string
     *                      example: 09:30
     *                  schedule:
     *                      type: number
     *                      example: 1
     *                      minimum: 1
     *          responses:
     *              '201':
     *                  description: A timeframe object
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
            ctx.body = await Timeframe.addItem(req_data as Timeframe)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /timeframe:
     *      put:
     *          tags:
     *              - Schedule
     *          summary: Update a timeframe.
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
     *              name: timeframe
     *              description: The timeframe to create.
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
     *                      example: 3
     *                  start:
     *                      type: string
     *                      example: 08:00
     *                  end:
     *                      type: string
     *                      example: 12:30
     *                  schedule:
     *                      type: number
     *                      example: 1
     *                      minimum: 1
     *          responses:
     *              '201':
     *                  description: A timeframe updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Timeframe.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await Timeframe.updateItem(req_data as Timeframe)
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
     * /timeframe/{id}:
     *      get:
     *          tags:
     *              - Schedule
     *          summary: Return timeframe by ID
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
            const user = ctx.user
            const where = { id: +ctx.params.id, company: user.company ? user.company : user.company }
            ctx.body = await Timeframe.getItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /timeframe:
     *      delete:
     *          tags:
     *              - Schedule
     *          summary: Delete a timeframe.
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
     *              name: timeframe
     *              description: The timeframe to create.
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
     *                  description: timeframe has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Timeframe.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await Timeframe.destroyItem(req_data as { id: number })
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
     * /timeframe:
     *      get:
     *          tags:
     *              - Schedule
     *          summary: Return timeframe list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: schedule_id
     *                required: true
     *                description: schedule id
     *                schema:
     *                    type: number
     *              - in: query
     *                name: name
     *                required: true
     *                description: name
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of timeframe
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user

            req_data.where = {
                company: { '=': user.company ? user.company : null },
                schedule: { '=': Number(req_data.schedule_id) },
                name: { '=': req_data.name }
            }
            ctx.body = await Timeframe.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
