import { DefaultContext } from 'koa'
import { AutoTaskSchedule } from '../model/entity/AutoTaskSchedule'
import { autoTaskScheduleValidation } from '../functions/validator'
import autoTaskcommands from '../model/entity/autoTaskcommands.json'
import { logUserEvents } from '../enums/logUserEvents.enum'

export default class AutoTaskScheduleController {
    /**
     *
     * @swagger
     *  /autoTaskSchedule:
     *      post:
     *          tags:
     *              - AutoTaskSchedule
     *          summary: Creates a autoTaskSchedule.
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
     *              name: autoTaskSchedule
     *              description: The autoTaskSchedule to create.
     *              schema:
     *                type: object
     *                required:
     *                  - name
     *                  - access_point
     *                  - command
     *                  - schedule_type
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Office 239 set mode Unlocked
     *                  description:
     *                      type: string
     *                  access_point:
     *                      type: number
     *                      example: 1
     *                  command:
     *                      type: Array<number>
     *                      example: [1, 2]
     *                  schedule:
     *                      type: number
     *                      example: 1
     *                  schedule_type:
     *                      type: string
     *                      enum: [preset_schedule, custom_schedule]
     *                      example: preset_schedule
     *                  custom_schedule:
     *                      type: object
     *                      properties:
     *                          start_date:
     *                              type: string
     *                              example: 2020.02.22
     *                          start_date_enable:
     *                              type: boolean
     *                              example: true
     *                          end_date:
     *                              type: string
     *                              example: 2020.02.22
     *                          end_date_enable:
     *                              type: boolean
     *                              example: false
     *                          start_time:
     *                              type: string
     *                              example: 19:00:00
     *                          start_time_enable:
     *                              type: boolean
     *                              example: true
     *                          end_time:
     *                              type: string
     *                              example: 06:15:00
     *                          end_time_enable:
     *                              type: boolean
     *                              example: true
     *                          repeat:
     *                              type: boolean
     *                              example: true
     *                          repeat_interval:
     *                              type: number
     *                              example: 2
     *                          repeat_unit:
     *                              type: string
     *                              enum: [hour, day, week, month]
     *                              example: hour
     *                          duration_days:
     *                              type: number
     *                              example: 60
     *                          unlimited:
     *                              type: boolean
     *                              example: false
     *                  condition:
     *                      type: string
     *                      enum: [in_progress, finished, pending]
     *                      example: pending
     *                  enable:
     *                      type: boolean
     *                      example: true
     *          responses:
     *              '201':
     *                  description: A autoTaskSchedule object
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
            const check = autoTaskScheduleValidation(req_data)
            if (check !== true) {
                ctx.status = 400
                return ctx.body = { message: check }
            }
            ctx.body = await AutoTaskSchedule.addItem(req_data as AutoTaskSchedule)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /autoTaskSchedule:
     *      put:
     *          tags:
     *              - AutoTaskSchedule
     *          summary: Update a autoTaskSchedule.
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
     *              name: autoTaskSchedule
     *              description: The autoTaskSchedule to create.
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
     *                      example: Office 239 set mode Unlocked
     *                  description:
     *                      type: string
     *                  access_point:
     *                      type: number
     *                      example: 1
     *                  command:
     *                      type: Array<number>
     *                      example: [1, 2]
     *                  schedule:
     *                      type: number
     *                      example: 1
     *                  schedule_type:
     *                      type: string
     *                      enum: [preset_schedule, custom_schedule]
     *                      example: preset_schedule
     *                  custom_schedule:
     *                      type: object
     *                      properties:
     *                          start_date:
     *                              type: string
     *                              example: 2020.02.22
     *                          start_date_enable:
     *                              type: boolean
     *                              example: true
     *                          end_date:
     *                              type: string
     *                              example: 2020.02.22
     *                          end_date_enable:
     *                              type: boolean
     *                              example: false
     *                          start_time:
     *                              type: string
     *                              example: 19:00:00
     *                          start_time_enable:
     *                              type: boolean
     *                              example: true
     *                          end_time:
     *                              type: string
     *                              example: 06:15:00
     *                          end_time_enable:
     *                              type: boolean
     *                              example: true
     *                          repeat:
     *                              type: boolean
     *                              example: true
     *                          repeat_interval:
     *                              type: number
     *                              example: 2
     *                          repeat_unit:
     *                              type: string
     *                              enum: [hour, day, week, month]
     *                              example: hour
     *                          duration_days:
     *                              type: number
     *                              example: 60
     *                          unlimited:
     *                              type: boolean
     *                              example: false
     *                  condition:
     *                      type: string
     *                      enum: [in_progress, finished, pending]
     *                      example: pending
     *                  enable:
     *                      type: boolean
     *                      example: true
     *          responses:
     *              '201':
     *                  description: A autoTaskSchedule updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            if (req_data.custom_schedule) {
                const check = autoTaskScheduleValidation(req_data)
                if (check !== true) {
                    ctx.status = 400
                    return ctx.body = { message: check }
                }
            }
            ctx.body = await AutoTaskSchedule.updateItem(req_data as AutoTaskSchedule)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /autoTaskSchedule/{id}:
     *      get:
     *          tags:
     *              - AutoTaskSchedule
     *          summary: Return autoTaskSchedule by ID
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
            ctx.body = await AutoTaskSchedule.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /autoTaskSchedule:
     *      delete:
     *          tags:
     *              - AutoTaskSchedule
     *          summary: Delete a autoTaskSchedule.
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
     *              name: autoTaskSchedule
     *              description: The autoTaskSchedule to create.
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
     *                  description: autoTaskSchedule has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }

            const auto_task = await AutoTaskSchedule.findOneOrFail({ where: where })
            ctx.body = await AutoTaskSchedule.destroyItem(where)
            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${AutoTaskSchedule.name}/${auto_task.name}`,
                value: { name: auto_task.name }
            }]
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /autoTaskSchedule:
     *      get:
     *          tags:
     *              - AutoTaskSchedule
     *          summary: Return autoTaskSchedule list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of autoTaskSchedule
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await AutoTaskSchedule.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /autoTaskSchedule/commands:
     *      get:
     *          tags:
     *              - AutoTaskSchedule
     *          summary: Return autoTaskSchedule commands list
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
    public static async getCommandsList (ctx: DefaultContext) {
        try {
            ctx.body = autoTaskcommands
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
