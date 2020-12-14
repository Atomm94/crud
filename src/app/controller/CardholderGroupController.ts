import { DefaultContext } from 'koa'
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
     *                properties:
     *                  name:
     *                      type: string
     *                  description:
     *                      type: string
     *                  parent__id:
     *                      type: number
     *                  limitation:
     *                      type: number
     *                  limitation_inherited:
     *                      type: boolean
     *                  anti_pass_back:
     *                      type: number
     *                  anti_pass_back_inherited:
     *                      type: boolean
     *                  time_attendance:
     *                      type: number
     *                  time_attendance_inherited:
     *                      type: boolean
     *                  access_rights:
     *                      type: number
     *                  access_rights_inherited:
     *                      type: boolean
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
            ctx.body = await CardholderGroup.addItem(ctx.request.body as CardholderGroup)
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
     *                  description:
     *                      type: string
     *                  parent__id:
     *                      type: number
     *                  limitation:
     *                      type: number
     *                  limitation_inherited:
     *                      type: boolean
     *                  anti_pass_back:
     *                      type: number
     *                  anti_pass_back_inherited:
     *                      type: boolean
     *                  time_attendance:
     *                      type: number
     *                  time_attendance_inherited:
     *                      type: boolean
     *                  access_rights:
     *                      type: number
     *                  access_rights_inherited:
     *                      type: boolean
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
            ctx.body = await CardholderGroup.updateItem(ctx.request.body as CardholderGroup)
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
            ctx.body = await CardholderGroup.getItem(+ctx.params.id)
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
            ctx.body = await CardholderGroup.destroyItem(ctx.request.body as { id: number })
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
            ctx.body = await CardholderGroup.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
