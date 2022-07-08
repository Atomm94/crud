import { DefaultContext } from 'koa'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { AccessPoint } from '../model/entity'
import { AccessPointZone } from '../model/entity/AccessPointZone'
import { AntipassBack } from '../model/entity/AntipassBack'
import { Reader } from '../model/entity/Reader'
export default class AccessPointZoneController {
    /**
     *
     * @swagger
     *  /accessPointZone:
     *      post:
     *          tags:
     *              - AccessPointZone
     *          summary: Creates a accessPointZone.
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
     *              name: accessPointZone
     *              description: The accessPointZone to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  description:
     *                      type: string
     *                  parent_id:
     *                      type: number
     *                  apb_reset_timer:
     *                      type: string
     *                  people_limits_min:
     *                      type: string
     *                  people_limits_max:
     *                      type: string
     *                  antipass_backs:
     *                      type: object
     *                      properties:
     *                          type:
     *                              type: string
     *                              enum: [disable, soft, semi_soft, hard, extra_hard]
     *                              example: disable
     *                          enable_timer:
     *                              type: boolean
     *                              example: false
     *                          time:
     *                              type: number
     *                              example: 60
     *                          time_type:
     *                              type: string
     *                              enum: [seconds, minutes, hours]
     *                              example: minutes
     *          responses:
     *              '201':
     *                  description: A accessPointZone object
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

            const antipass_back = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
            req_data.antipass_back = antipass_back.id
            const access_point_zone = await AccessPointZone.addItem(req_data as AccessPointZone) as AccessPointZone
            access_point_zone.antipass_backs = antipass_back

            ctx.body = access_point_zone
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessPointZone:
     *      put:
     *          tags:
     *              - AccessPointZone
     *          summary: Update a accessPointZone.
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
     *              name: accessPointZone
     *              description: The accessPointZone to create.
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
     *                  description:
     *                      type: string
     *                  parent_id:
     *                      type: number
     *                  apb_reset_timer:
     *                      type: string
     *                  people_limits_min:
     *                      type: string
     *                  people_limits_max:
     *                      type: string
     *                  antipass_backs:
     *                      type: object
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          type:
     *                              type: string
     *                              enum: [disable, soft, semi_soft, hard, extra_hard]
     *                              example: disable
     *                          enable_timer:
     *                              type: boolean
     *                              example: false
     *                          time:
     *                              type: number
     *                              example: 60
     *                          time_type:
     *                              type: string
     *                              enum: [seconds, minutes, hours]
     *                              example: minutes
     *          responses:
     *              '201':
     *                  description: A accessPointZone updated object
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
            const check_by_company = await AccessPointZone.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await AccessPointZone.updateItem(req_data as AccessPointZone)
                const antipass_back_data = await AntipassBack.updateItem(req_data.antipass_backs as AntipassBack)
                ctx.oldData = updated.old
                ctx.body = { ...updated.new, antipass_backs: antipass_back_data.new }
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
     * /accessPointZone/{id}:
     *      get:
     *          tags:
     *              - AccessPointZone
     *          summary: Return accessPointZone by ID
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
            // const where = { id: +ctx.params.id, company: user.company ? user.company : user.company }
            // const relations = ['access_points']
            // ctx.body = await AccessPointZone.getItem(where, relations)

            const access_point_zone: any = await AccessPointZone.createQueryBuilder('access_point_zone')
            .leftJoinAndSelect('access_point_zone.access_points', 'access_point', 'access_point.delete_date is null')
            .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
            .leftJoinAndSelect('access_point_zone.antipass_backs', 'antipass_back')
            .where(`access_point_zone.id = '${+ctx.params.id}'`)
            .andWhere(`access_point_zone.company = '${user.company ? user.company : null}'`)
            .getOne()
            if (!access_point_zone) {
                ctx.status = 400
               return ctx.body = { message: 'Invalid AccessPointZone Id' }
            }
            ctx.body = access_point_zone
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessPointZone:
     *      delete:
     *          tags:
     *              - AccessPointZone
     *          summary: Delete a accessPointZone.
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
     *              name: accessPointZone
     *              description: The accessPointZone to create.
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
     *                  description: accessPointZone has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }

            const childs = await AccessPointZone.findOne({ parent_id: req_data.id })
            if (childs) {
                ctx.status = 400
                ctx.body = { message: 'Can\'t remove group with subzones' }
            } else {
                const access_points = await AccessPoint.findOne({ access_point_zone: req_data.id })
                if (access_points) {
                    ctx.status = 400
                    ctx.body = { message: 'Can\'t remove group with access points' }
                } else {
                    const readers = await Reader.findOne({
                        where: [
                            { leaving_zone: req_data.id },
                            { came_to_zone: req_data.id }
                        ]
                    })
                    if (readers) {
                        ctx.status = 400
                        ctx.body = { message: 'Can\'t remove group with readers' }
                    }
                    const access_point_zone = await AccessPointZone.findOneOrFail({ where: where })
                    ctx.body = await AccessPointZone.destroyItem(where)
                    ctx.logsData = [{
                        event: logUserEvents.DELETE,
                        target: `${AccessPointZone.name}/${access_point_zone.name}`,
                        value: { name: access_point_zone.name }
                    }]
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
     * /accessPointZone:
     *      get:
     *          tags:
     *              - AccessPointZone
     *          summary: Return accessPointZone list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accessPointZone
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            req_data.relations = ['antipass_backs']
            ctx.body = await AccessPointZone.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
