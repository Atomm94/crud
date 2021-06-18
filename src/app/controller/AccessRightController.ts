import { DefaultContext } from 'koa'
import { acuStatus } from '../enums/acuStatus.enum'
import { AccessRule, Cardholder } from '../model/entity'
import { AccessRight } from '../model/entity/AccessRight'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import SdlController from './Hardware/SdlController'

export default class AccessRightController {
    /**
     *
     * @swagger
     *  /accessRight:
     *      post:
     *          tags:
     *              - AccessRight
     *          summary: Creates a accessRight.
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
     *              name: accessRight
     *              description: The accessRight to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                      example: APT 50
     *                  description:
     *                      type: string
     *                      example: description
     *          responses:
     *              '201':
     *                  description: A accessRight object
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
            ctx.body = await AccessRight.addItem(req_data as AccessRight)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessRight:
     *      put:
     *          tags:
     *              - AccessRight
     *          summary: Update a accessRight.
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
     *              name: accessRight
     *              description: The accessRight to create.
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
     *                      example: APT 50
     *                  description:
     *                      type: string
     *                      example: description
     *          responses:
     *              '201':
     *                  description: A accessRight updated object
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
            const check_by_company = await AccessRight.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await AccessRight.updateItem(req_data as AccessRight)
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
     * /accessRight/{id}:
     *      get:
     *          tags:
     *              - AccessRight
     *          summary: Return accessRight by ID
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

            const access_right = await AccessRight.createQueryBuilder('access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point')
                .leftJoinAndSelect('access_rule.schedules', 'schedule')
                .where(`access_right.id = '${+ctx.params.id}'`)
                .andWhere(`access_right.company = '${user.company ? user.company : user.company}'`)
                .getMany()

            ctx.body = access_right[0]
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessRight:
     *      delete:
     *          tags:
     *              - AccessRight
     *          summary: Delete a accessRight.
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
     *              name: accessRight
     *              description: The accessRight to create.
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
     *                  description: accessRight has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null
            const where = { id: req_data.id, company: company }
            const location = `${user.company_main}/${user.company}`

            const cardholders = await Cardholder.findOne({ where: { access_right: req_data.id, company: company } })
            if (cardholders) {
                ctx.status = 400
                return ctx.body = { message: `You can't destroy this AccessRight ${req_data.id}, foreign key with Cardholder` }
            } else {
                const cardholder_groups = await CardholderGroup.findOne({ where: { access_right: req_data.id, company: company } })
                if (cardholder_groups) {
                    ctx.status = 400
                    return ctx.body = { message: `You can't destroy this AccessRight ${req_data.id}, foreign key with CardholderGroup` }
                }
            }

            const access_rules: any = await AccessRule.getAllItems({ relations: ['schedules', 'access_points', 'access_points.acus'], where: { access_right: { '=': req_data.id } } })
            let active_rule = false
            for (const access_rule of access_rules) {
                if (access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                    active_rule = true
                    const send_data = {
                        id: access_rule.id,
                        access_point: access_rule.access_point,
                        access_right: access_rule.access_right,
                        access_right_delete: true
                    }
                    SdlController.delSdl(location, access_rule.access_points.acus.serial_number, send_data, user.id, access_rule.schedules.type, access_rule.access_points.acus.session_id)
                } else {
                    AccessRule.destroyItem({ id: access_rule.id, company: access_rule.company })
                }
            }
            if (active_rule) {
                ctx.body = { message: 'Delete pending' }
            } else {
                ctx.body = await AccessRight.destroyItem(where)
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
     * /accessRight:
     *      get:
     *          tags:
     *              - AccessRight
     *          summary: Return accessRight list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accessRight
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await AccessRight.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /accessRight/relations/{id}:
     *      get:
     *          tags:
     *              - AccessRight
     *          summary: Return accessRightRelations by ID
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
                .innerJoin('cardholder_group.cardholders', 'cardholder')
                .select('cardholder_group.name')
                .addSelect('COUNT(cardholder.id) as cardholders_qty')
                .where(`cardholder_group.company = ${company}`)
                .andWhere(`cardholder_group.access_right = ${ctx.params.id}`)
                .groupBy('cardholder.cardholder_group')
                .getRawMany()
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
