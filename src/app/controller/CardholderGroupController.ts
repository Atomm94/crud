import { DefaultContext } from 'koa'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { locationGenerator } from '../functions/locationGenerator'
import { Cardholder, Limitation } from '../model/entity'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { OperatorType } from '../mqtt/Operators'
import CardKeyController from './Hardware/CardKeyController'
export default class CardholderGroupController {
    /**
     *
     * @swagger
     *  /cardholderGroup:
     *      post:
     *          tags:
     *              - CardholderGroup
     *          summary: Creates a cardholderGroup.
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
     *              name: cardholderGroup
     *              description: The cardholderGroup to create.
     *              schema:
     *                type: object
     *                required:
     *                 - name
     *                 - time_attendance
     *                 - access_right
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Floor 3
     *                  description:
     *                      type: string
     *                      example: description
     *                  parent_id:
     *                      type: number | null
     *                      example: 1
     *                  limitation_inherited:
     *                      type: boolean
     *                      example: true
     *                  limitations:
     *                      type: object
     *                      properties:
     *                          enable_date:
     *                              type: boolean
     *                              example: true
     *                          valid_from:
     *                              type: string
     *                              example: 2020-04-04 00:00:00
     *                          valid_due:
     *                              type: string
     *                              example: 2020-05-05 15:00:00
     *                          pass_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          pass_counter_passes:
     *                              type: number
     *                              example: 25
     *                          pass_counter_current:
     *                              type: number
     *                              example: 10
     *                          first_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          first_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          first_use_counter_current:
     *                              type: number
     *                              example: 10
     *                          last_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          last_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          last_use_counter_current:
     *                              type: number
     *                              example: 10
     *                  antipass_back_inherited:
     *                      type: boolean
     *                      example: false
     *                  enable_antipass_back:
     *                      type: boolean
     *                      example: false
     *                  time_attendance_inherited:
     *                      type: boolean
     *                      example: false
     *                  time_attendance:
     *                      type: number
     *                      example: 1
     *                  access_right_inherited:
     *                      type: boolean
     *                      example: false
     *                  access_right:
     *                      type: number
     *                      example: 1
     *                  default:
     *                      type: boolean
     *                      example: false
     *          responses:
     *              '201':
     *                  description: A cardholderGroup object
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

            let parent_data: any
            if (req_data.parent_id && (req_data.limitation_inherited || req_data.antipass_back_inherited || req_data.time_attendance_inherited || req_data.access_right_inherited)) {
                parent_data = await CardholderGroup.getItem({ id: req_data.parent_id, company: req_data.company })
            }

            if (req_data.limitation_inherited && parent_data) {
                req_data.limitation = parent_data.limitation
            } else {
                const limitation_data = await Limitation.addItem(req_data.limitations as Limitation)
                if (limitation_data) {
                    req_data.limitation = limitation_data.id
                }
            }

            // if (req_data.antipass_back_inherited && parent_data) {
            //     req_data.antipass_back = parent_data.antipass_back
            // } else {
            //     const antipass_back_data = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
            //     if (antipass_back_data) {
            //         req_data.antipass_back = antipass_back_data.id
            //     }
            // }

            if (req_data.antipass_back_inherited && parent_data) {
                req_data.enable_antipass_back = parent_data.enable_antipass_back
            }

            if (req_data.access_right_inherited && parent_data) {
                req_data.access_right = parent_data.access_right
            }

            if (req_data.time_attendance_inherited && parent_data) {
                req_data.time_attendance = parent_data.time_attendance
            }
            const new_group: any = await CardholderGroup.addItem(req_data as CardholderGroup)
            if (req_data.default) {
                const old_default_group: any = await CardholderGroup.createQueryBuilder('cardholder_group')
                    .where(`company = '${user.company}'`)
                    .andWhere(`cardholder_group.default = ${true}`)
                    .andWhere(`id != ${new_group.id}`)
                    .getOne()
                old_default_group.default = false
                old_default_group.save()
            }
            ctx.body = new_group
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
     *  /cardholderGroup:
     *      put:
     *          tags:
     *              - CardholderGroup
     *          summary: Update a cardholderGroup.
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
     *              name: cardholderGroup
     *              description: The cardholderGroup to create.
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
     *                      example: Floor 3
     *                  description:
     *                      type: string
     *                      example: description
     *                  limitation_inherited:
     *                      type: boolean
     *                      example: true
     *                  limitations:
     *                      type: object
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          enable_date:
     *                              type: boolean
     *                              example: true
     *                          valid_from:
     *                              type: string
     *                              example: 2020-04-04 00:00:00
     *                          valid_due:
     *                              type: string
     *                              example: 2020-05-05 15:00:00
     *                          pass_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          pass_counter_passes:
     *                              type: number
     *                              example: 25
     *                          pass_counter_current:
     *                              type: number
     *                              example: 10
     *                          first_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          first_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          first_use_counter_current:
     *                              type: number
     *                              example: 10
     *                          last_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          last_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          last_use_counter_current:
     *                              type: number
     *                              example: 10
     *                  antipass_back_inherited:
     *                      type: boolean
     *                      example: false
     *                  enable_antipass_back:
     *                      type: boolean
     *                      example: false
     *                  time_attendance_inherited:
     *                      type: boolean
     *                      example: false
     *                  time_attendance:
     *                      type: number
     *                      example: 1
     *                  access_right_inherited:
     *                      type: boolean
     *                      example: false
     *                  access_right:
     *                      type: number
     *                      example: 1
     *                  default:
     *                      type: boolean
     *                      example: false
     *          responses:
     *              '201':
     *                  description: A cardholderGroup updated object
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
            const check_by_company: any = await CardholderGroup.findOne({ where, relations: ['limitations'] })
            const location = await locationGenerator(user)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await CardholderGroup.updateItem(req_data as CardholderGroup, user)

                if (!check_by_company.default && req_data.default) {
                    const old_default_group: any = await CardholderGroup.createQueryBuilder('cardholder_group')
                        .where(`company = ${user.company}`)
                        .andWhere(`cardholder_group.default = ${true}`)
                        .andWhere(`id != ${check_by_company.id}`)
                        .getOne()
                    if (old_default_group) {
                        old_default_group.default = false
                        old_default_group.save()
                    }
                } else if (check_by_company.default && !req_data.default) {
                    const new_default_group: any = await CardholderGroup.createQueryBuilder('cardholder_group')
                        .where(`company = ${user.company}`)
                        .andWhere('parent_id is null')
                        .getOne()
                    if (new_default_group) {
                        new_default_group.default = true
                        new_default_group.save()
                    }
                }

                const new_limitations = await Limitation.findOne({ where: { id: updated.new.limitation } })
                if (new_limitations) {
                    if (updated.new.access_right !== updated.old.access_right ||
                        JSON.stringify(check_by_company.limitations.valid_from) !== JSON.stringify(new_limitations.valid_from) ||
                        JSON.stringify(check_by_company.limitations.valid_due) !== JSON.stringify(new_limitations.valid_due)
                    ) {
                        const cardholders = await Cardholder.find({
                            where: [
                                { cardholder_group: updated.new.id, access_right_inherited: true },
                                { cardholder_group: updated.new.id, limitation_inherited: true }
                            ]
                        })
                        if (cardholders.length) {
                            CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, user.company, user, null)
                        }
                    }
                }
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
     * /cardholderGroup/{id}:
     *      get:
     *          tags:
     *              - CardholderGroup
     *          summary: Return cardholderGroup by ID
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
            const relations = ['limitations', 'time_attendances', 'access_rights']
            ctx.body = await CardholderGroup.getItem(where, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /cardholderGroup:
     *      delete:
     *          tags:
     *              - CardholderGroup
     *          summary: Delete a cardholderGroup.
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
     *              name: cardholderGroup
     *              description: The cardholderGroup to create.
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
     *                  description: cardholderGroup has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const id = ctx.request.body.id
            const user = ctx.user
            const where = { id: id, company: user.company ? user.company : null }
            const childs = await CardholderGroup.find({ parent_id: id })
            if (childs.length) {
                ctx.status = 400
                ctx.body = { message: 'Can\'t remove group with childs' }
            } else {
                const cardholders = await Cardholder.find({ cardholder_group: id })
                if (cardholders.length) {
                    ctx.status = 400
                    ctx.body = { message: 'Can\'t remove group with cardholders' }
                } else {
                    const cardholder_group = await CardholderGroup.findOneOrFail({ where: where })
                    console.log('🚀 ~ file: CardholderGroupController.ts ~ line 431 ~ CardholderGroupController ~ destroy ~ cardholder_group', cardholder_group)
                    if (!cardholder_group.parent_id || cardholder_group.default) {
                        console.log(5968969689)

                        ctx.status = 400
                        return ctx.body = { message: "Can't delete Default Cardholder Group" }
                    }
                    ctx.body = await CardholderGroup.destroyItem(where)
                    ctx.logsData = [{
                        event: logUserEvents.DELETE,
                        target: `${CardholderGroup.name}/${cardholder_group.name}`,
                        value: { name: cardholder_group.name }
                    }]
                }
            }
        } catch (error) {
            console.log('🚀 ~ file: CardholderGroupController.ts ~ line 445 ~ CardholderGroupController ~ destroy ~ error', error)
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /cardholderGroup:
     *      get:
     *          tags:
     *              - CardholderGroup
     *          summary: Return cardholderGroup list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of cardholderGroup
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await CardholderGroup.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /cardholderGroup/relations/{id}:
     *      get:
     *          tags:
     *              - CardholderGroup
     *          summary: Return CardholderGroupRelations by ID
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
            const where = {
                company: { '=': user.company ? user.company : null },
                cardholder_group: { '=': ctx.params.id }
            }
            ctx.body = await Cardholder.getAllItems({ where: where })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
