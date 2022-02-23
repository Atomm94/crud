import { DefaultContext } from 'koa'
import { AutoTaskSchedule } from '../model/entity/AutoTaskSchedule'
import { autoTaskScheduleValidation } from '../functions/validator'
import autoTaskcommands from '../model/entity/autoTaskcommands.json'
import acpEventList from '../model/entity/acpEventList.json'
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
     *                  - acu
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Office 239 set mode Unlocked
     *                  description:
     *                      type: string
     *                  access_point:
     *                      type: number
     *                      example: 1
     *                  acu:
     *                      type: number
     *                      example: 1
     *                  reaction:
     *                      type: number
     *                      example: 1
     *                  reaction_type:
     *                      type: string
     *                      enum: [OUTPUT_MANAGEMENT_RELAY_MODULE,MANAGEMENT_OF_OUTPUT_CONTROLLERS,MANAGEMENT_OF_ACCESS_POINTS]
     *                      example: MANAGEMENT_OF_ACCESS_POINTS
     *                  conditions:
     *                      type: object
     *                      properties:
     *                          TmBeginCondition:
     *                              type: string
     *                              example: 20:00:00
     *                          TimeCondition:
     *                              type: boolean
     *                              example: true
     *                          TmEndCondition:
     *                              type: string
     *                              example: 20:00:00
     *                          repeat:
     *                              type: boolean
     *                              example: true
     *                          EventsDirection:
     *                              type: number
     *                              example: 1
     *                          EventsCondition:
     *                              type: Array<number>
     *                              example: [1, 2]
     *                          DaysOfWeek:
     *                              type: Array<number>
     *                              example: [1, 2]
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
     *                  acu:
     *                      type: number
     *                      example: 1
     *                  reaction:
     *                      type: number
     *                      example: 1
     *                  reaction_type:
     *                      type: string
     *                      enum: [OUTPUT_MANAGEMENT_RELAY_MODULE,MANAGEMENT_OF_OUTPUT_CONTROLLERS,MANAGEMENT_OF_ACCESS_POINTS]
     *                      example: MANAGEMENT_OF_ACCESS_POINTS
     *                  conditions:
     *                      type: object
     *                      properties:
     *                          TmBeginCondition:
     *                              type: string
     *                              example: 20:00:00
     *                          TimeCondition:
     *                              type: boolean
     *                              example: true
     *                          TmEndCondition:
     *                              type: string
     *                              example: 20:00:00
     *                          repeat:
     *                              type: boolean
     *                              example: true
     *                          EventsDirection:
     *                              type: number
     *                              example: 1
     *                          EventsCondition:
     *                              type: Array<number>
     *                              example: [1, 2]
     *                          DaysOfWeek:
     *                              type: Array<number>
     *                              example: [1, 2]
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
            const data = await AutoTaskSchedule.createQueryBuilder('auto_task_schedule')
                .leftJoinAndSelect('auto_task_schedule.acus', 'acu', 'acu.delete_date is null')
                .leftJoinAndSelect('auto_task_schedule.access_points', 'access_point', 'access_point.delete_date is null')
                .where(`schedule.id = ${+ctx.params.id}`)
                .andWhere(`schedule.company = ${ctx.user.company}`)
                .getOne()
            ctx.body = data
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
            const req_data = ctx.query
            const user = ctx.user
            req_data.relations = ['access_points']
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await AutoTaskSchedule.getAllItems(req_data)
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
            const commands = autoTaskcommands
            const events = acpEventList

            ctx.body = {
                commands,
                events
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
