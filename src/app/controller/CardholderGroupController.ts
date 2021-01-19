import { DefaultContext } from 'koa'
import { Cardholder, Limitation } from '../model/entity'
import { AntipassBack } from '../model/entity/AntipassBack'
import { CardholderGroup } from '../model/entity/CardholderGroup'
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
     *                  antipass_backs:
     *                      type: object
     *                      properties:
     *                          type:
     *                              type: disable | soft | semi_soft | hard | extra_hard
     *                              example: disable
     *                          enable_timer:
     *                              type: boolean
     *                              example: false
     *                          time:
     *                              type: number
     *                              example: 60
     *                          time_type:
     *                              type: seconds | minutes | hours
     *                              example: minutes
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
                const limitation_data: any = await Limitation.addItem(req_data.limitations as Limitation)
                req_data.limitation = limitation_data.id
            }

            if (req_data.antipass_back_inherited && parent_data) {
                req_data.antipass_back = parent_data.antipass_back
            } else {
                const antipass_back_data: any = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
                req_data.antipass_back = antipass_back_data.id
            }

            if (req_data.access_right_inherited && parent_data) {
                req_data.access_right = parent_data.access_right
            }

            if (req_data.time_attendance_inherited && parent_data) {
                req_data.time_attendance = parent_data.time_attendance
            }

            ctx.body = await CardholderGroup.addItem(req_data as CardholderGroup)
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
     *                  antipass_backs:
     *                      type: object
     *                      properties:
     *                          type:
     *                              type: disable | soft | semi_soft | hard | extra_hard
     *                              example: disable
     *                          enable_timer:
     *                              type: boolean
     *                              example: false
     *                          time:
     *                              type: number
     *                              example: 60
     *                          time_type:
     *                              type: seconds | minutes | hours
     *                              example: minutes
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
            const check_by_company = await CardholderGroup.getItem({ id: req_data.id, company: user.company ? user.company : null })

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                let parent_data: any
                if (req_data.limitation_inherited || req_data.antipass_back_inherited || req_data.time_attendance_inherited || req_data.access_right_inherited) {
                    const data: any = await CardholderGroup.getItem({ id: req_data.id, company: user.company ? user.company : null })
                    parent_data = await CardholderGroup.getItem({ id: data.parent_id, company: user.company ? user.company : null })
                }

                if (req_data.limitation_inherited && parent_data) {
                    req_data.limitation = parent_data.limitation
                } else {
                    if (req_data.limitations.id) {
                        await Limitation.updateItem(req_data.limitations as Limitation)
                    } else {
                        const limitation_data: any = await Limitation.addItem(req_data.limitations as Limitation)
                        req_data.limitation = limitation_data.id
                    }
                }

                if (req_data.antipass_back_inherited && parent_data) {
                    req_data.antipass_back = parent_data.antipass_back
                } else {
                    if (req_data.antipass_backs.id) {
                        await AntipassBack.updateItem(req_data.antipass_backs as AntipassBack)
                    } else {
                        const antipass_back_data: any = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
                        req_data.antipass_back = antipass_back_data.id
                    }
                }

                if (req_data.access_right_inherited && parent_data) {
                    req_data.access_right = parent_data.access_right
                }

                if (req_data.time_attendance_inherited && parent_data) {
                    req_data.time_attendance = parent_data.time_attendance
                }

                const updated = await CardholderGroup.updateItem(req_data as CardholderGroup)
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
            const relations = ['limitations', 'antipass_backs', 'time_attendances', 'access_rights']
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
            const check_by_company = await CardholderGroup.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
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
                        ctx.body = await CardholderGroup.destroyItem(id)
                    }
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
