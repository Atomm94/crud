import { DefaultContext } from 'koa'
import { Testmodule1 } from '../model/entity/Testmodule1'
export default class Testmodule1Controller {
    /**
     *
     * @swagger
     *  /testmodule1:
     *      post:
     *          tags:
     *              - Testmodule1
     *          summary: Creates a testmodule1.
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
     *              name: testmodule1
     *              description: The testmodule1 to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  first_name:
     *                      type: string
     *                  gender:
     *                      type: number
     *                  body:
     *                      type: JSON
     *          responses:
     *              '201':
     *                  description: A testmodule1 object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await Testmodule1.addItem(ctx.request.body as Testmodule1)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /testmodule1:
     *      put:
     *          tags:
     *              - Testmodule1
     *          summary: Update a testmodule1.
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
     *              name: testmodule1
     *              description: The testmodule1 to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  first_name:
     *                      type: string
     *                  gender:
     *                      type: number
     *                  body:
     *                      type: JSON
     *          responses:
     *              '201':
     *                  description: A testmodule1 updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await Testmodule1.updateItem(ctx.request.body as Testmodule1)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /testmodule1/{id}:
     *      get:
     *          tags:
     *              - Testmodule1
     *          summary: Return testmodule1 by ID
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
            ctx.body = await Testmodule1.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /testmodule1:
     *      delete:
     *          tags:
     *              - Testmodule1
     *          summary: Delete a testmodule1.
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
     *              name: testmodule1
     *              description: The testmodule1 to create.
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
     *                  description: testmodule1 has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await Testmodule1.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /testmodule1:
     *      get:
     *          tags:
     *              - Testmodule1
     *          summary: Return testmodule1 list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of testmodule1
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await Testmodule1.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
