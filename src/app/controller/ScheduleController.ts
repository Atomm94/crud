import { DefaultContext } from 'koa'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { scheduleType } from '../enums/scheduleType.enum'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { Schedule } from '../model/entity/Schedule'
// import { Timeframe } from '../model/entity/Timeframe'

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
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Unlimited 24/7 - Daily
     *                  description:
     *                      type: string
     *                      example: description
     *                  type:
     *                      type: string
     *                      enum: [daily, weekly, specific, flexitime, ordinal]
     *                      example: daily
     *                  start_from:
     *                      type: string | null
     *                      example: 2020-12-31
     *                  repeat_month:
     *                      type: number | null
     *                      example: 1
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
            const req_data = ctx.request.body
            const user = ctx.user
            req_data.company = user.company ? user.company : null
            ctx.body = await Schedule.addItem(req_data as Schedule)
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
     *                  start_from:
     *                      type: string | null
     *                      example: 2020-12-31
     *                  repeat_month:
     *                      type: number | null
     *                      example: 1
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
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Schedule.findOne({ where })

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await Schedule.updateItem(req_data as Schedule)
                ctx.oldData = updated.old
                ctx.body = updated.new
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
            const user = ctx.user
            const company = ctx.user.company
            const partition_parent_id = (user.companyData && user.companyData.partition_parent_id) ? user.companyData.partition_parent_id : null
            const data = await Schedule.createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`schedule.id = ${+ctx.params.id}`)
                .getOne()
            if (!data) {
                ctx.status = 400
                return ctx.body = { message: 'Invalid id' }
            }

            if (partition_parent_id) {
                if (![company, partition_parent_id].includes(data.company)) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid id' }
                }
            } else {
                if (data.company !== company) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid id' }
                }
            }
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
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            let schedule: any = await Schedule.createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.cardholders', 'cardholder', 'cardholder.delete_date is null')
                .leftJoinAndSelect('schedule.cardholder_groups', 'cardholder_group', 'cardholder_group.delete_date is null')
                .leftJoinAndSelect('schedule.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .where(`schedule.id = '${where.id}'`)
                .andWhere(`schedule.company = '${where.company}'`)
                .getMany()

            schedule = schedule[0]

            if (schedule.cardholders.length) {
                ctx.status = 400
                return ctx.body = { message: `You can't destroy this Schedule ${req_data.id}, foreign key with Cardholder` }
            } else if (schedule.cardholder_groups.length) {
                ctx.status = 400
                return ctx.body = { message: `You can't destroy this Schedule ${req_data.id}, foreign key with CardholderGroup` }
            } else if (schedule.access_rules.length) {
                ctx.status = 400
                return ctx.body = { message: `You can't destroy this Schedule ${req_data.id}, foreign key with AccessRule` }
            }

            // const schedule = await Schedule.findOneOrFail({ where: where })
            ctx.body = await Schedule.destroyItem(where)

            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Schedule.name}/${schedule.name}`,
                value: { name: schedule.name }
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
     *              - in: query
     *                name: type
     *                description: search
     *                schema:
     *                    type: string
     *                    enum: [daily, weekly, specific, flexitime, ordinal]
     *                    example: weekly
     *          responses:
     *              '200':
     *                  description: Array of schedule
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            const where: any = {
                company: { '=': user.company ? user.company : null },
                custom: { '=': false }
            }
            if (req_data.type) {
                if (!Object.values(scheduleType).includes(req_data.type)) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid Schedule type' }
                } else {
                    where.type = { '=': req_data.type }
                }
            }
            req_data.where = where
            ctx.body = await Schedule.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /schedule/tree:
     *      get:
     *          tags:
     *              - Schedule
     *          summary: Return schedule tree
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Tree of schedule
     *              '401':
     *                  description: Unauthorized
     */
    public static async getTree (ctx: DefaultContext) {
        try {
            const user = ctx.user
            const company = user.company ? user.company : null
            ctx.body = await Schedule.createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .select('schedule.*')
                .addSelect('timeframe.name')
                .where(`schedule.company = ${company}`)
                .groupBy('timeframe.name')
                .addGroupBy('schedule.id')
                .getRawMany()
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /schedule/relations/{id}:
     *      get:
     *          tags:
     *              - Schedule
     *          summary: Return scheduleRelations by ID
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
    public static async getRelations (ctx: DefaultContext) {
        try {
            const user = ctx.user
            const company = user.company ? user.company : null
            ctx.body = await CardholderGroup.createQueryBuilder('cardholder_group')
                .innerJoin('cardholder_group.cardholders', 'cardholder', 'cardholder.delete_date is null')
                .innerJoin('cardholder_group.access_rights', 'access_right', 'access_right.delete_date is null')
                .innerJoin('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .innerJoin('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                .select('cardholder_group.name')
                .addSelect('COUNT(cardholder.id) as cardholders_qty')
                .addSelect('access_right.name as access_right')
                .where(`cardholder_group.company = ${company}`)
                .andWhere(`schedule.id = ${ctx.params.id}`)
                .groupBy('cardholder.cardholder_group')
                .getRawMany()
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
