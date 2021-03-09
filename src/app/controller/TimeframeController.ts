import { DefaultContext } from 'koa'
import { acuStatus } from '../enums/acuStatus.enum'
import { scheduleType } from '../enums/scheduleType.enum'
import { Schedule } from '../model/entity'
import { AccessRule } from '../model/entity/AccessRule'
import { Timeframe } from '../model/entity/Timeframe'
import { OperatorType } from '../mqtt/Operators'
import SendDeviceMessage from '../mqtt/SendDeviceMessage'

export default class TimeframeController {
    /**
     *
     * @swagger
     *  /schedule/timeframe:
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
            const save: any = await Timeframe.addItem(req_data as Timeframe)
            ctx.body = save

            const access_rules: any = await AccessRule.createQueryBuilder('access_rule')
                .innerJoinAndSelect('access_rule.access_points', 'access_point')
                .innerJoinAndSelect('access_point.acus', 'acu')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .getMany()
            const location = `${user.company_main}/${user.company}`
            const schedule: any = await Schedule.findOne({ id: save.schedule })
            const timeframes = await Timeframe.find({ schedule: schedule.id })
            const send_data = { ...req_data, timeframes: timeframes }

            for (const access_rule of access_rules) {
                let operator: OperatorType = OperatorType.SET_SDL_DAILY
                if (schedule.type === scheduleType.WEEKLY) {
                    operator = OperatorType.SET_SDL_WEEKLY
                } else if (schedule.type === scheduleType.FLEXITIME) {
                    send_data.start_from = schedule.start_from
                    send_data.schedule_type = schedule.type
                    operator = OperatorType.DEL_SDL_FLEXI_TIME
                } else if (schedule.type === scheduleType.SPECIFIC) {
                    send_data.schedule_type = schedule.type
                    operator = OperatorType.DEL_SDL_SPECIFIED
                }
                new SendDeviceMessage(operator, location, access_rule.access_points.acus.serial_number, send_data, access_rule.access_points.acus.session_id)
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
     *  /schedule/timeframe:
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
            // const updated = await Timeframe.updateItem(req_data as Timeframe)
            // ctx.oldData = updated.old
            // ctx.body = updated.new

            const timeframe: any = await Timeframe.findOne({ id: req_data.id })

            const access_rules: any = await AccessRule.createQueryBuilder('access_rule')
                .innerJoinAndSelect('access_rule.access_points', 'access_point')
                .innerJoinAndSelect('access_point.acus', 'acu')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .getMany()
            const location = `${user.company_main}/${user.company}`
            const schedule: any = await Schedule.findOne({ id: timeframe.schedule })
            const timeframes = await Timeframe.find({ schedule: schedule.id })
            const send_data = { ...req_data, timeframes: timeframes }

            for (const access_rule of access_rules) {
                let operator: OperatorType = OperatorType.SET_SDL_DAILY
                if (schedule.type === scheduleType.WEEKLY) {
                    operator = OperatorType.SET_SDL_WEEKLY
                } else if (schedule.type === scheduleType.FLEXITIME) {
                    send_data.start_from = schedule.start_from
                    send_data.type = schedule.type
                    operator = OperatorType.DEL_SDL_FLEXI_TIME
                } else if (schedule.type === scheduleType.SPECIFIC) {
                    send_data.type = schedule.type
                    operator = OperatorType.DEL_SDL_SPECIFIED
                }
                new SendDeviceMessage(operator, location, access_rule.access_points.acus.serial_number, send_data, access_rule.access_points.acus.session_id)
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
     * /schedule/timeframe/{id}:
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
     *  /schedule/timeframe:
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
            const timeframe: any = await Timeframe.findOne(req_data.id)

            ctx.body = await Timeframe.destroyItem(req_data as { id: number })

            const access_rules: any = await AccessRule.createQueryBuilder('access_rule')
                .innerJoinAndSelect('access_rule.access_points', 'access_point')
                .innerJoinAndSelect('access_point.acus', 'acu')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .getMany()
            const location = `${user.company_main}/${user.company}`
            const schedule: any = await Schedule.findOne({ id: timeframe.schedule })
            const timeframes = await Timeframe.find({ schedule: schedule.id })
            const send_data = { ...req_data, timeframes: timeframes }

            for (const access_rule of access_rules) {
                let operator: OperatorType = OperatorType.SET_SDL_DAILY
                if (schedule.type === scheduleType.WEEKLY) {
                    operator = OperatorType.SET_SDL_WEEKLY
                } else if (schedule.type === scheduleType.FLEXITIME) {
                    send_data.start_from = schedule.start_from
                    send_data.type = schedule.type
                    operator = OperatorType.DEL_SDL_FLEXI_TIME
                } else if (schedule.type === scheduleType.SPECIFIC) {
                    send_data.type = schedule.type
                    operator = OperatorType.DEL_SDL_SPECIFIED
                }
                new SendDeviceMessage(operator, location, access_rule.access_points.acus.serial_number, send_data, access_rule.access_points.acus.session_id)
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
     * /schedule/timeframe:
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

    /**
     *
     * @swagger
     *  /schedule/timeframe/clone:
     *      put:
     *          tags:
     *              - Timeframe
     *          summary: Clone a timeframe.
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
     *                  - copy_id
     *                  - copy_name
     *                  - paste_id
     *                  - paste_name
     *                properties:
     *                  copy_id:
     *                      type: number
     *                      example: 1
     *                  copy_name:
     *                      type: string
     *                      example: day1
     *                  paste_id:
     *                      type: number
     *                      example: 1
     *                  paste_name:
     *                      type: string
     *                      example: day2
     *          responses:
     *              '201':
     *                  description: A timeframe updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async clone (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { schedule: req_data.copy_id, name: req_data.copy_name, company: user.company }
            const timeFrames = await Timeframe.find(where)
            const deleteWhere = { schedule: req_data.paste_id, company: user.company, name: req_data.paste_name }
            if (timeFrames.length) {
                await Timeframe.delete(deleteWhere)
                const newTimeFrames = []
                for (let i = 0; i < timeFrames.length; i++) {
                    const el = timeFrames[i]
                    const timeframe = new Timeframe()
                    timeframe.name = req_data.paste_name
                    timeframe.start = el.start
                    timeframe.end = el.end
                    timeframe.schedule = req_data.paste_id
                    timeframe.company = user.company
                    newTimeFrames.push(timeframe)
                }
                ctx.body = await Timeframe.save(newTimeFrames)
            } else {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
