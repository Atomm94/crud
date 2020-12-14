import { DefaultContext } from 'koa'
import { AntipassBack } from '../model/entity/AntipassBack'
export default class AntipassBackController {
    /**
     *
     * @swagger
     *  /antipassBack:
     *      post:
     *          tags:
     *              - AntipassBack
     *          summary: Creates a antipassBack.
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
     *              name: antipassBack
     *              description: The antipassBack to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  type:
     *                      type: string
     *                  enable_timer:
     *                      type: boolean
     *                  time:
     *                      type: number
     *                  time_type:
     *                      type: string
     *                  company:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A antipassBack object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await AntipassBack.addItem(ctx.request.body as AntipassBack)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /antipassBack:
     *      put:
     *          tags:
     *              - AntipassBack
     *          summary: Update a antipassBack.
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
     *              name: antipassBack
     *              description: The antipassBack to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  type:
     *                      type: string
     *                  enable_timer:
     *                      type: boolean
     *                  time:
     *                      type: number
     *                  time_type:
     *                      type: string
     *                  company:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A antipassBack updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await AntipassBack.updateItem(ctx.request.body as AntipassBack)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /antipassBack/{id}:
     *      get:
     *          tags:
     *              - AntipassBack
     *          summary: Return antipassBack by ID
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
            ctx.body = await AntipassBack.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /antipassBack:
     *      delete:
     *          tags:
     *              - AntipassBack
     *          summary: Delete a antipassBack.
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
     *              name: antipassBack
     *              description: The antipassBack to create.
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
     *                  description: antipassBack has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await AntipassBack.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /antipassBack:
     *      get:
     *          tags:
     *              - AntipassBack
     *          summary: Return antipassBack list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of antipassBack
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await AntipassBack.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
