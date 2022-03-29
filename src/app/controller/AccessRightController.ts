import { DefaultContext } from 'koa'
import { acuStatus } from '../enums/acuStatus.enum'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { AccessRule, Cardholder } from '../model/entity'
import { AccessRight } from '../model/entity/AccessRight'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import SdlController from './Hardware/SdlController'
import { locationGenerator } from '../functions/locationGenerator'

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
            let access_right: any
            access_right = await AccessRight.createQueryBuilder('access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point')
                .leftJoinAndSelect('access_rule.schedules', 'schedule')
                .where(`access_right.id = '${+ctx.params.id}'`)
                .andWhere(`access_right.company = '${user.company ? user.company : null}'`)
                .getOne()
            if (user.companyData.partition_parent_id) {
                if (user.companyData.access_right) {
                    if (+ctx.params.id === user.companyData.access_right) {
                        access_right = await AccessRight.createQueryBuilder('access_right')
                            .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                            .leftJoinAndSelect('access_rule.access_points', 'access_point')
                            .leftJoinAndSelect('access_rule.schedules', 'schedule')
                            .where(`access_right.id = '${+user.companyData.access_right}'`)
                            .andWhere(`access_right.company = '${user.companyData.partition_parent_id ? user.companyData.partition_parent_id : null}'`)
                            .getOne()
                        access_right.edit = false
                    }
                } else {
                    access_right = await AccessRight.createQueryBuilder('access_right')
                        .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                        .leftJoinAndSelect('access_rule.access_points', 'access_point')
                        .leftJoinAndSelect('access_rule.schedules', 'schedule')
                        .where(`access_right.id = '${+ctx.params.id}'`)
                        .andWhere(`access_right.company = '${user.company ? user.company : null}'`)
                        .getOne()
                }
            }
            ctx.body = access_right
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
            const location = await locationGenerator(user)
            const logs_data = []

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

            // const access_rules: any = await AccessRule.getAllItems({ relations: ['schedules', 'access_points', 'access_points.acus'], where: { access_right: { '=': req_data.id } } })

            const access_rules: any = await AccessRule.createQueryBuilder('access_rule')
                .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`access_rule.access_right = '${req_data.id}'`)
                .getMany()

            let active_rule = false
            for (const access_rule of access_rules) {
                if (access_rule.access_points && access_rule.access_points.acus && access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                    active_rule = true
                    const send_data = {
                        id: access_rule.id,
                        access_point: access_rule.access_point,
                        access_right: access_rule.access_right,
                        access_right_delete: true
                    }
                    SdlController.delSdl(location, access_rule.access_points.acus.serial_number, send_data, user, access_rule.schedules.type, access_rule.access_points.acus.session_id)
                } else {
                    AccessRule.destroyItem({ id: access_rule.id, company: access_rule.company })
                    logs_data.push({
                        event: logUserEvents.DELETE,
                        target: `${AccessRule.name}/${access_rule.access_points.name}`,
                        value: { name: access_rule.access_points.name }
                    })
                }
            }
            if (active_rule) {
                ctx.body = { message: 'Delete pending' }
            } else {
                const access_right = await AccessRight.findOneOrFail({ where: where })
                ctx.body = await AccessRight.destroyItem(where)
                logs_data.push({
                    event: logUserEvents.DELETE,
                    target: `${AccessRight.name}/${access_right.name}`,
                    value: { name: access_right.name }
                })
            }
            ctx.logsData = logs_data
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
            req_data.where = {
                company: { '=': user.company ? user.company : null },
                custom: false
            }
            const access_rights: any = await AccessRight.getAllItems(req_data)
            let pasted_access_right: any = ''
            if (user.companyData.partition_parent_id) {
                if (user.companyData.access_right) {
                    pasted_access_right = await AccessRight.findOne({ where: { id: user.companyData.access_right } })
                    if (pasted_access_right) {
                        pasted_access_right.edit = false
                        access_rights.push(pasted_access_right)
                    }
                }
            }
            ctx.body = access_rights
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
                .innerJoin('cardholder_group.cardholders', 'cardholder', 'cardholder.delete_date is null')
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
