import { DefaultContext } from 'koa'
import { Schedule } from '../model/entity'
import { Acu } from '../model/entity/Acu'
import { acuStatus } from '../enums/acuStatus.enum'
import { Timeframe } from '../model/entity/Timeframe'
import { In } from 'typeorm'
import { AccessPoint } from '../model/entity/AccessPoint'
import { AccessRule } from '../model/entity/AccessRule'
import SdlController from './Hardware/SdlController'
import CardKeyController from './Hardware/CardKeyController'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { OperatorType } from '../mqtt/Operators'
import { locationGenerator } from '../functions/locationGenerator'

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
            const location = await locationGenerator(user)
            req_data.company = user.company ? user.company : null

            let where: any
            where = { company: req_data.company }

            if (user.companyData.partition_parent_id) {
                where = { company: user.companyData.partition_parent_id }
            }
            if (req_data.access_point) {
                where.id = In(req_data.access_point)
            } else if (req_data.access_group) {
                where.access_point_group = In(req_data.access_group)
            } else if (req_data.access_zone) {
                where.access_point_zone = In(req_data.access_zone)
            }
            const access_points: AccessPoint[] = await AccessPoint.find({ where })
            const res_data: any = []
            let send_set_card_key = false
            for (const access_point of access_points) {
                const data = req_data
                data.access_point = access_point.id
                try {
                    const access_rule: AccessRule = await AccessRule.addItem(data as AccessRule)
                    // const relation = ['access_points']
                    // const returnData = AccessRule.getItem({ id: access_rule.id }, relation)

                    const returnData: any = await AccessRule.createQueryBuilder('access_rule')
                        .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                        .where(`access_rule.id = '${access_rule.id}'`)
                        .getOne()

                    res_data.push(returnData)
                    const acu: Acu = await Acu.getItem({ id: access_point.acu })
                    if (acu.status === acuStatus.ACTIVE) {
                        SdlController.setSdl(location, acu.serial_number, access_rule, user, acu.session_id)
                        send_set_card_key = true

                        // const cardholders = await Cardholder.getAllItems({
                        //     relations: ['credentials'],
                        //     where: {
                        //         access_right: { '=': access_rule.access_right },
                        //         company: { '=': req_data.company }
                        //     }
                        // })

                        // const cardholders: Cardholder[] = await Cardholder.createQueryBuilder('cardholder')
                        //     .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                        //     .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                        //     .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                        //     .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                        //     .leftJoinAndSelect('cardholder.limitations', 'limitation')
                        //     .where(`cardholder.access_right = '${access_rule.access_right}'`)
                        //     .andWhere(`cardholder.company = '${req_data.company}'`)
                        //     .getMany()

                        // CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, req_data.company, user, [access_point], cardholders)
                        // CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, req_data.company, user, null)

                        // const cardholders: any = await Cardholder.createQueryBuilder('cardholder')
                        //     .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                        //     .where(`cardholder.access_right = '${access_rule.access_right}'`)
                        //     .andWhere(`cardholder.company = '${req_data.company}'`)
                        //     .getMany()
                        // CardKeyController.editCardKey(location, req_data.company, user.id, access_rule, null, cardholders)
                        ctx.body = true
                    }
                } catch (error) {
                   // console.log('error', error.message ? error.message : error)
                }
            }
            if (send_set_card_key) {
                CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, req_data.company, user, null)
            }
            ctx.body = await Promise.all(res_data)
        } catch (error) {
            //console.log('error2', error)

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
     *                      type: string
     *                      enum: [enable, disable]
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
            // const where = { id: req_data.id, company: user.company ? user.company : null }
            // const access_rule: AccessRule = await AccessRule.findOneOrFail({ where: where, relations: ['schedules'] })
            const access_rule: any = await AccessRule.createQueryBuilder('access_rule')
                .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                .where(`access_rule.id = '${req_data.id}'`)
                .andWhere(`access_rule.company = '${user.company ? user.company : null}'`)
                .getOne()
            const location = await locationGenerator(user)
            if (!access_rule) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const access_point: AccessPoint = await AccessPoint.findOneOrFail({ where: { id: access_rule.access_point } })
                const acu: Acu = await Acu.findOneOrFail({ where: { id: access_point.acu } })
                var data
                if (acu.status === acuStatus.ACTIVE) {
                    if (access_rule.schedule !== req_data.schedule) {
                        if ('access_in_holidays' in req_data && req_data.access_in_holidays !== access_rule.access_in_holidays) {
                            const save_data = Object.assign({}, req_data)
                            delete save_data.schedule
                            const updated = await AccessRule.updateItem(save_data as AccessRule)
                            ctx.oldData = updated.old
                            data = updated.new
                        }
                        delete req_data.access_in_holidays
                        const schedule: Schedule = await Schedule.findOneOrFail({ where: { id: req_data.schedule } })
                        const timeframes = await Timeframe.find({ where: { schedule: schedule.id } })
                        const send_data = { ...req_data, schedule_type: schedule.type, start_from: schedule.start_from, timeframes: timeframes, access_point: access_point.id }
                        if (access_rule.schedules.type !== schedule.type) {
                            SdlController.delSdl(location, acu.serial_number, send_data, user, access_rule.schedules.type, acu.session_id, true)
                        } else {
                            SdlController.setSdl(location, acu.serial_number, send_data, user, acu.session_id, true)
                        }
                        ctx.body = {
                            data: data,
                            message: 'Update Pending'
                        }
                    } else if ('access_in_holidays' in req_data && req_data.access_in_holidays !== access_rule.access_in_holidays) {
                        const updated = await AccessRule.updateItem(req_data as AccessRule)
                        ctx.oldData = updated.old
                        ctx.body = updated.new
                    } else {
                        ctx.body = access_rule
                    }
                } else {
                    const updated = await AccessRule.updateItem(req_data as AccessRule)
                    ctx.oldData = updated.old
                    ctx.body = updated.new
                }
            }
        } catch (error) {
          //  console.log(error)

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
            const company = ctx.user.company
            const partition_parent_id = (user.companyData && user.companyData.partition_parent_id) ? user.companyData.partition_parent_id : null
            const access_rule = await AccessRule.createQueryBuilder('access_rule')
                .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                .where(`access_rule.id = '${+ctx.params.id}'`)
                .getOne()

            if (!access_rule) {
                ctx.status = 400
                return ctx.body = { message: 'Invalid id' }
            }

            if (partition_parent_id) {
                if (![company, partition_parent_id].includes(access_rule.company)) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid id' }
                }
            } else {
                if (access_rule.company !== company) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid id' }
                }
            }

            ctx.body = access_rule
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
            const access_rule = await AccessRule.findOne({ where })
            const location = await locationGenerator(user)
            const logs_data = []
            if (!access_rule) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.logsData = []
                const access_point: AccessPoint = await AccessPoint.findOneOrFail({ where: { id: access_rule.access_point } })
                const acu: Acu = await Acu.findOneOrFail({ where: { id: access_point.acu } })
                if (acu.status === acuStatus.ACTIVE) {
                    const schedule: Schedule = await Schedule.findOneOrFail({ where: { id: access_rule.schedule } })

                    const send_data = { id: access_rule.id, access_point: access_point.id }
                    SdlController.delSdl(location, acu.serial_number, send_data, user, schedule.type, acu.session_id)
                    ctx.body = { message: 'Delete pending' }
                } else {
                    ctx.body = await AccessRule.destroyItem(where)
                    logs_data.push({
                        event: logUserEvents.DELETE,
                        target: `${AccessRule.name}/${access_point.name}`,
                        value: { name: access_point.name }
                    })
                }
            }
            ctx.logsData = logs_data
        } catch (error) {
          //  console.log(error)

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
