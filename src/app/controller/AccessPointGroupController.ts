import { DefaultContext } from 'koa'
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
     *                  company:
     *                      type: number
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
            ctx.body = await AccessPointGroup.addItem(ctx.request.body as AccessPointGroup)
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
     *                  company:
     *                      type: number
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
            ctx.body = await AccessPointGroup.updateItem(ctx.request.body as AccessPointGroup)
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
            const where = {
                id: +ctx.params.id,
                company: user.company ? user.company : user.company
            }
            // const relations = ['access_points']

            ctx.body = await AccessPointGroup.getItem(where)
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
            ctx.body = await AccessPointGroup.destroyItem(ctx.request.body as { id: number })
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
            ctx.body = await AccessPointGroup.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
