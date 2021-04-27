import { DefaultContext } from 'koa'
import { Cardholder, Schedule } from '../model/entity'
import { Acu } from '../model/entity/Acu'
import { acuStatus } from '../enums/acuStatus.enum'
import SendDeviceMessage from '../mqtt/SendDeviceMessage'
import { OperatorType } from '../mqtt/Operators'
import { Timeframe } from '../model/entity/Timeframe'
import { In } from 'typeorm'
import { AccessPoint } from '../model/entity/AccessPoint'
import { AccessRule } from '../model/entity/AccessRule'
import SdlController from './Hardware/SdlController'

export default class AccessRuleController {
    /**
     *
     * @swagger
     *  /accessRight/accessRule:
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
     *                  - access_right
     *                  - schedule
     *                properties:
     *                  access_right:
     *                      type: number
     *                      example: 1
     *                      minimum: 1
     *                  access_point:
     *                      type: Array<number>
     *                      example: [1]
     *                  access_point_group:
     *                      type: Array<number>
     *                      example: [1]
     *                  access_point_zone:
     *                      type: Array<number>
     *                      example: [1]
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

            const where: any = { company: req_data.company }
            if (req_data.access_point) {
                where.id = In(req_data.access_point)
            } else if (req_data.access_group) {
                where.access_point_group = In(req_data.access_group)
            } else if (req_data.access_zone) {
                where.access_point_zone = In(req_data.access_zone)
            }
            const access_points: AccessPoint[] = await AccessPoint.find({ ...where })
            const res_data: any = []

            for (const access_point of access_points) {
                const data = req_data
                data.access_point = access_point.id
                const access_rule: AccessRule = await AccessRule.addItem(data as AccessRule)
                const relation = ['access_points']
                const returnData = AccessRule.getItem({ id: access_rule.id }, relation)
                res_data.push(returnData)
                const acu: Acu = await Acu.getItem({ id: access_point.acu })
                if (acu.status === acuStatus.ACTIVE) {
                    SdlController.setSdl(location, acu.serial_number, access_rule, acu.session_id)

                    const cardholders = await Cardholder.getAllItems({
                        relations: ['credentials'],
                        where: {
                            access_right: access_rule.access_right,
                            company: req_data.company
                        }
                    })
                    if (cardholders.length) {
                        const send_edit_data = {
                            access_rule: access_rule,
                            cardholders: cardholders
                        }

                        const acus: any = await Acu.getAllItems({ where: { status: { '=': acuStatus.ACTIVE } } })
                        acus.forEach((item_acu: any) => {
                            new SendDeviceMessage(OperatorType.EDIT_KEY, location, item_acu.serial_number, send_edit_data, item_acu.session_id)
                        })
                    }
                    ctx.body = true
                }
            }
            ctx.body = await Promise.all(res_data)
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
     *  /accessRight/accessRule:
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
            const access_rule: AccessRule = await AccessRule.findOneOrFail({ where: where, relations: ['schedules'] })
            const location = `${user.company_main}/${user.company}`
            if (!access_rule) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const access_point: AccessPoint = await AccessPoint.findOneOrFail({ id: access_rule.access_point })
                const acu: Acu = await Acu.findOneOrFail({ id: access_point.acu })
                if (acu.status === acuStatus.ACTIVE) {
                    if (access_rule.schedule !== req_data.schedule) {
                        const schedule: Schedule = await Schedule.findOneOrFail({ id: req_data.schedule })
                        const timeframes = await Timeframe.find({ schedule: schedule.id })
                        const send_data = { ...req_data, schedule_type: schedule.type, start_from: schedule.start_from, timeframes: timeframes, access_point: access_point.id }
                        SdlController.delSdl(location, acu.serial_number, send_data, schedule.type, acu.session_id, true)
                    }
                    ctx.body = true
                } else {
                    const updated = await AccessRule.updateItem(req_data as AccessRule)
                    ctx.oldData = updated.old
                    ctx.body = updated.new
                }
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
     * /accessRight/accessRule/{id}:
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
     *  /accessRight/accessRule:
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
            const access_rule = await AccessRule.findOne(where)
            const location = `${user.company_main}/${user.company}`
            if (!access_rule) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const access_point: AccessPoint = await AccessPoint.findOneOrFail({ id: access_rule.access_point })
                const acu: Acu = await Acu.findOneOrFail({ id: access_point.acu })
                if (acu.status === acuStatus.ACTIVE) {
                    const schedule: Schedule = await Schedule.findOneOrFail({ id: access_rule.schedule })

                    const send_data = { id: access_rule.id, access_point: access_point.id }
                    SdlController.delSdl(location, acu.serial_number, send_data, schedule.type, acu.session_id)
                    ctx.body = { message: 'Delete pending' }
                } else {
                    ctx.body = await AccessRule.destroyItem(where)
                }
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
     * /accessRight/accessRule:
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
