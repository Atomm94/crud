import { DefaultContext } from 'koa'
import { acuStatus } from '../enums/acuStatus.enum'
import { Schedule } from '../model/entity'
import { AccessRule } from '../model/entity/AccessRule'
import { Timeframe } from '../model/entity/Timeframe'
import { CheckScheduleSettings } from '../functions/check-schedule-settings'
import SdlController from './Hardware/SdlController'
import { logUserEvents } from '../enums/logUserEvents.enum'

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
            const save = await Timeframe.addItem(req_data as Timeframe)
            console.log(',save', save)

            ctx.body = save

            const access_rules = await AccessRule.createQueryBuilder('access_rule')
                .innerJoinAndSelect('access_rule.access_points', 'access_point')
                .innerJoinAndSelect('access_point.acus', 'acu')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`access_rule.schedule = ${req_data.schedule}`)
                .getMany()
            const location = `${user.company_main}/${user.company}`
            const schedule = await Schedule.findOneOrFail({ id: save.schedule })
            const timeframes = await Timeframe.find({ schedule: schedule.id })
            const check_schedule = CheckScheduleSettings.checkSettings(schedule.type, schedule, save)
            if (check_schedule !== true) {
                ctx.status = 400
                return ctx.body = { message: check_schedule }
            }
            for (const access_rule of access_rules) {
                const send_data: any = { id: access_rule.id, access_point: access_rule.access_point, timeframes: timeframes }
                SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, user.id, access_rule.access_points.acus.session_id, send_data)
            }
        } catch (error) {
            console.log('error', error)

            ctx.status = error.status || 400
            if (error.message) {
                ctx.body = {
                    message: error.message
                }
            } else {
                ctx.body = error
            }
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
            const updated = await Timeframe.updateItem(req_data as Timeframe)
            ctx.oldData = updated.old
            ctx.body = updated.new

            const access_rules = await AccessRule.createQueryBuilder('access_rule')
                .innerJoinAndSelect('access_rule.access_points', 'access_point')
                .innerJoinAndSelect('access_point.acus', 'acu')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`access_rule.schedule = ${req_data.schedule}`)
                .getMany()
            const location = `${user.company_main}/${user.company}`

            let schedule
            if (req_data.id) {
                const timeframe = await Timeframe.findOneOrFail({ id: req_data.id })
                schedule = await Schedule.findOneOrFail({ id: timeframe.schedule })
            } else {
                schedule = await Schedule.findOneOrFail({ id: req_data.schedule })
            }
            const timeframes = await Timeframe.find({ schedule: schedule.id })

            for (const access_rule of access_rules) {
                const send_data: any = { id: access_rule.id, access_point: access_rule.access_point, timeframes: timeframes }
                SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, user.id, access_rule.access_points.acus.session_id, send_data)
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
            const where: any = { company: user.company }
            if (req_data.id) {
                where.id = req_data.id
            } else {
                where.schedule = req_data.schedule
                where.name = req_data.name
            }
            const timeframe: Timeframe = await Timeframe.findOneOrFail({ where: where })
            req_data.company = user.company
            ctx.body = await Timeframe.destroyItem(req_data)
            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Timeframe.name}/${timeframe.name}`,
                value: { name: timeframe.name }
            }]
            const schedule = await Schedule.findOneOrFail({ id: timeframe.schedule })

            const access_rules = await AccessRule.createQueryBuilder('access_rule')
                .innerJoinAndSelect('access_rule.access_points', 'access_point')
                .innerJoinAndSelect('access_point.acus', 'acu')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`access_rule.schedule = ${schedule.id}`)
                .getMany()
            const location = `${user.company_main}/${user.company}`
            const timeframes = await Timeframe.find({ schedule: schedule.id })

            for (const access_rule of access_rules) {
                const send_data: any = { id: access_rule.id, access_point: access_rule.access_point, timeframes: timeframes }
                SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, user.id, access_rule.access_points.acus.session_id, send_data)
            }
        } catch (error) {
            console.log(error)

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
            console.log('reqdata', req_data)

            const where = { schedule: req_data.copy_id, name: req_data.copy_name, company: user.company }
            const timeFrames = await Timeframe.find(where)
            const deleteWhere = { schedule: req_data.paste_id, company: user.company, name: req_data.paste_name }
            console.log('timeFrames', timeFrames)

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
