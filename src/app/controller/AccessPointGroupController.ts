import { DefaultContext } from 'koa'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { AccessPointGroup } from '../model/entity/AccessPointGroup'
export default class AccessPointGroupController {
    /**
     *
     * @swagger
     *  /accessPointGroup:
     *      post:
     *          tags:
     *              - AccessPointGroup
     *          summary: Creates a accessPointGroup.
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
     *              name: accessPointGroup
     *              description: The accessPointGroup to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  description:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A accessPointGroup object
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
            ctx.body = await AccessPointGroup.addItem(req_data as AccessPointGroup)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessPointGroup:
     *      put:
     *          tags:
     *              - AccessPointGroup
     *          summary: Update a accessPointGroup.
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
     *              name: accessPointGroup
     *              description: The accessPointGroup to create.
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
     *          responses:
     *              '201':
     *                  description: A accessPointGroup updated object
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
            const check_by_company = await AccessPointGroup.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await AccessPointGroup.updateItem(req_data as AccessPointGroup)
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
     * /accessPointGroup/{id}:
     *      get:
     *          tags:
     *              - AccessPointGroup
     *          summary: Return accessPointGroup by ID
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
            // ctx.body = await AccessPointGroup.getItem(where, relations)
            const access_point_group: any = await AccessPointGroup.createQueryBuilder('access_point_group')
                .leftJoinAndSelect('access_point_group.access_points', 'access_point', 'access_point.delete_date is null')
                .where(`access_point_group.id = '${+ctx.params.id}'`)
                .andWhere(`access_point_group.company = '${user.company ? user.company : user.company}'`)
                .getOne()

            ctx.body = access_point_group
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessPointGroup:
     *      delete:
     *          tags:
     *              - AccessPointGroup
     *          summary: Delete a accessPointGroup.
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
     *              name: accessPointGroup
     *              description: The accessPointGroup to create.
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
     *                  description: accessPointGroup has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }

            const access_point_group = await AccessPointGroup.findOneOrFail({ where: where })
            ctx.body = await AccessPointGroup.destroyItem(where)

            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${AccessPointGroup.name}/${access_point_group.name}`,
                value: { name: access_point_group.name }
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
     * /accessPointGroup:
     *      get:
     *          tags:
     *              - AccessPointGroup
     *          summary: Return accessPointGroup list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accessPointGroup
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await AccessPointGroup.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
