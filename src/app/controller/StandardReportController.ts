import { DefaultContext } from 'koa'
import { generateDatesFromPeriod } from '../functions/generate-dates-from-period'
import { standartReportPeriodValidation } from '../functions/validator'
import { EventLog } from '../model/entity'
import { StandardReport } from '../model/entity/StandardReport'
import eventList from '../model/entity/eventList.json'

export default class StandardReportController {
    /**
     *
     * @swagger
     *  /standardReport:
     *      post:
     *          tags:
     *              - StandardReport
     *          summary: Creates a standardReport.
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
     *              name: standardReport
     *              description: The standardReport to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Standard daily report
     *                  description:
     *                      type: string
     *                  period:
     *                      type: object
     *                      properties:
     *                          key:
     *                              type: string
     *                              enum: [current_day, current_week, current_month, previous_day, previous_week, previous_month, target_day, target_month, target_period]
     *                              example: target_period
     *                          value:
     *                              type: object
     *                              properties:
     *                                  start_date:
     *                                      type: string
     *                                      example: 2020.02.22
     *                                  end_date:
     *                                      type: string
     *                                      example: 2020.02.22
     *                  start_time:
     *                      type: string
     *                      example: 00:00:00
     *                  end_time:
     *                      type: string
     *                      example: 23:59:00
     *                  events:
     *                      type: Array<number>
     *                      example: [1,2]
     *                  access_points:
     *                      type: Array<number>
     *                      example: [1,2]
     *                  cardholders:
     *                      type: Array<number>
     *                      example: [1,2]
     *          responses:
     *              '201':
     *                  description: A standardReport object
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
            req_data.author = user.id
            const check = standartReportPeriodValidation(req_data.period)
            if (check !== true) {
                ctx.status = 400
                return ctx.body = { message: check }
            }
            ctx.body = await StandardReport.addItem(ctx.request.body as StandardReport)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /standardReport:
     *      put:
     *          tags:
     *              - StandardReport
     *          summary: Update a standardReport.
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
     *              name: standardReport
     *              description: The standardReport to create.
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
     *                      example: Standard daily report
     *                  description:
     *                      type: string
     *                      example: 1
     *                  period:
     *                      type: object
     *                      properties:
     *                          key:
     *                              type: string
     *                              enum: [current_day, current_week, current_month, previous_day, previous_week, previous_month, target_day, target_month, target_period]
     *                              example: target_day
     *                          value:
     *                              type: string
     *                              example: 2020.02.22
     *                  start_time:
     *                      type: string
     *                      example: 00:00:00
     *                  end_time:
     *                      type: string
     *                      example: 23:59:00
     *                  events:
     *                      type: Array<number>
     *                      example: [1,2]
     *                  access_points:
     *                      type: Array<number>
     *                      example: [1,2]
     *                  cardholders:
     *                      type: Array<number>
     *                      example: [1,2]
     *          responses:
     *              '201':
     *                  description: A standardReport updated object
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
            if (req_data.period) {
                const check = standartReportPeriodValidation(req_data.period)
                if (check !== true) {
                    ctx.status = 400
                    return ctx.body = { message: check }
                }
            }
            const check_by_company = await StandardReport.findOne(where)
            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await StandardReport.updateItem(req_data as StandardReport)
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
     * /standardReport/{id}:
     *      get:
     *          tags:
     *              - StandardReport
     *          summary: Return standardReport by ID
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
            ctx.body = await StandardReport.getItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /standardReport:
     *      delete:
     *          tags:
     *              - StandardReport
     *          summary: Delete a standardReport.
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
     *              name: standardReport
     *              description: The standardReport to create.
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
     *                  description: standardReport has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            ctx.body = await StandardReport.destroyItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /standardReport:
     *      get:
     *          tags:
     *              - StandardReport
     *          summary: Return standardReport list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of standardReport
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await StandardReport.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /standardReport/execute:
     *      get:
     *          tags:
     *              - StandardReport
     *          summary: Return standardReport list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: access_points
     *                description: access_points
     *                schema:
     *                    type: array
     *                    items:
     *                      type:number
     *              - in: query
     *                name: cardholders
     *                description: cardholders
     *                schema:
     *                    type: array
     *                    items:
     *                      type:number
     *              - in: query
     *                name: events
     *                description: events
     *                schema:
     *                    type: array
     *                    items:
     *                      type:number
     *              - in: query
     *                name: start_time
     *                description: start time
     *                schema:
     *                    type: string
     *              - in: query
     *                name: end_time
     *                description: end time
     *                schema:
     *                    type: string
     *              - in: query
     *                name: period
     *                description: period
     *                schema:
     *                    type: object
     *                    properties:
     *                        key:
     *                            type: string
     *                            enum: [current_day, current_week, current_month, previous_day, previous_week, previous_month, target_day, target_month, target_period]
     *          responses:
     *              '200':
     *                  description: Array of standardReport
     *              '401':
     *                  description: Unauthorized
     */

    public static async execute (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.period = JSON.parse(req_data.period)
            const check = standartReportPeriodValidation(req_data.period)

            if (check !== true) {
                ctx.status = 400
                return ctx.body = { message: check }
            }
            const { start_from, start_to } = generateDatesFromPeriod(req_data.period, req_data.start_time, req_data.end_time)
            req_data.start_from = start_from
            req_data.start_to = start_to
            const logs = await EventLog.get(user, req_data)
            ctx.body = logs
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /standardReport/eventList:
     *      get:
     *          tags:
     *              - StandardReport
     *          summary: Return eventList
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of commands
     *              '401':
     *                  description: Unauthorized
     */
    public static async getEventList (ctx: DefaultContext) {
        try {
            // const send_data = []
            // const event_list: any = eventList
            // Object.keys(event_list).forEach(group_id => {
            //     event_list[group_id] = 4
            //     const group_name = event_list[group_id].name
            //     const events = event_list[group_id].events
            //     Object.keys(events).forEach(event_id => {

            //     })
            // })
            ctx.body = eventList
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
