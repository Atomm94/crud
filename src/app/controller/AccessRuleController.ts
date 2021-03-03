import { DefaultContext } from 'koa'
import { Schedule } from '../model/entity'
import { AccessPoint } from '../model/entity/AccessPoint'
import { AccessRule } from '../model/entity/AccessRule'
import { Acu } from '../model/entity/Acu'
import SendDevice from '../mqtt/SendDevice'
import { acuStatus } from '../enums/acuStatus.enum'
import { scheduleType } from '../enums/scheduleType.enum'

export default class AccessRuleController {
    /**
     *
     * @swagger
     *  /accessRule:
     *      post:
     *          tags:
     *              - AccessRule
     *          summary: Creates a accessRule.
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
     *              name: accessRule
     *              description: The accessRule to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  access_right:
     *                      type: number
     *                      example: 1
     *                      minimum: 1
     *                  access_point:
     *                      type: number | Array<number>
     *                      example: 1
     *                  schedule:
     *                      type: number
     *                      example: 1
     *                      minimum: 1
     *                  access_in_holidays:
     *                      type: boolean
     *                      example: false
     *          responses:
     *              '201':
     *                  description: A accessRule object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const location = `${user.company_main}/${user.company}`
            req_data.company = user.company ? user.company : null
            const access_point: any = await AccessPoint.findOne({ id: req_data.access_point })
            const acu: any = await Acu.findOne({ id: access_point.acu })
            if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                await AccessRule.addItem(req_data as AccessRule)
                const schedule: any = await Schedule.findOne({ id: req_data.schedule })
                if (schedule.type === scheduleType.DAILY) {
                    SendDevice.setSdlDaily(location, acu.serial_number, acu.session_id, req_data)
                } else if (schedule.type === scheduleType.WEEKLY) {
                    SendDevice.setSdlWeekly(location, acu.serial_number, acu.session_id, req_data)
                } else if (schedule.type === scheduleType.FLEXITIME) {
                    SendDevice.setSdlFlexiTime(location, acu.serial_number, acu.session_id, req_data, schedule)
                } else if (schedule.type === scheduleType.SPECIFIC) {
                    SendDevice.setSdlSpecified(location, acu.serial_number, acu.session_id, req_data)
                }
                ctx.body = true
            } else {
                if (Array.isArray(req_data.access_point)) {
                    const res_data: any = []
                    for (const access_point of req_data.access_point) {
                        const data = req_data
                        data.access_point = access_point
                        const save = await AccessRule.addItem(data as AccessRule)
                        res_data.push(save)
                    }
                    ctx.body = await res_data
                } else {
                    ctx.body = await AccessRule.addItem(req_data as AccessRule)
                }
            }
        } catch (error) {
            console.log('error', error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessRule:
     *      put:
     *          tags:
     *              - AccessRule
     *          summary: Update a accessRule.
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
     *              name: accessRule
     *              description: The accessRule to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  schedule:
     *                      type: number
     *                      example: 1
     *                      minimum: 1
     *                  access_in_holidays:
     *                      type: enable | disable
     *                      example: disable
     *          responses:
     *              '201':
     *                  description: A accessRule updated object
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
            const check_by_company = await AccessRule.findOne(where)
            const location = `${user.company_main}/${user.company}`
            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const access_point: any = await AccessPoint.findOne({ id: req_data.access_point })
                const acu: any = await Acu.findOne({ id: access_point.acu })
                if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                    const schedule: any = await Schedule.findOne({ id: req_data.schedule })
                    if (check_by_company.schedule !== req_data.schedule) {
                        const old_data: any = await AccessRule.findOne({ id: req_data.id })
                        SendDevice.dellShedule(location, acu.serial_number, acu.session_id, req_data, schedule.type, old_data)
                    }
                    ctx.body = true
                }

                const updated = await AccessRule.updateItem(req_data as AccessRule)
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
     * /accessRule/{id}:
     *      get:
     *          tags:
     *              - AccessRule
     *          summary: Return accessRule by ID
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
            const relations = ['schedules']
            ctx.body = await AccessRule.getItem(where, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessRule:
     *      delete:
     *          tags:
     *              - AccessRule
     *          summary: Delete a accessRule.
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
     *              name: accessRule
     *              description: The accessRule to create.
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
     *                  description: accessRule has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await AccessRule.findOne(where)
            const location = `${user.company_main}/${user.company}`
            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const access_point: any = await AccessPoint.findOne({ id: req_data.access_point })
                const acu: any = await Acu.findOne({ id: access_point.acu })
                if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                    const schedule: any = await Schedule.findOne({ id: req_data.schedule })
                    const old_data: any = await AccessRule.findOne({ id: req_data.id })
                    if (check_by_company.schedule !== req_data.schedule) {
                        SendDevice.dellShedule(location, acu.serial_number, acu.session_id, null, schedule.type, old_data)
                    }
                    ctx.body = true
                    ctx.body = await AccessRule.destroyItem(req_data as { id: number })
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
     * /accessRule:
     *      get:
     *          tags:
     *              - AccessRule
     *          summary: Return accessRule list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accessRule
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await AccessRule.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
