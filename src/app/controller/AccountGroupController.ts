import { DefaultContext } from 'koa'
import { AccountGroup } from '../model/entity/AccountGroup'
export default class AccountGroupController {
    /**
     *
     * @swagger
     *  /accountGroup:
     *      post:
     *          tags:
     *              - AccountGroup
     *          summary: Creates a accountGroup.
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
     *              name: accountGroup
     *              description: The accountGroup to create.
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
     *                  company:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A accountGroup object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await AccountGroup.addItem(ctx.request.body as AccountGroup)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accountGroup:
     *      put:
     *          tags:
     *              - AccountGroup
     *          summary: Update a accountGroup.
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
     *              name: accountGroup
     *              description: The accountGroup to create.
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
     *                  company:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A accountGroup updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await AccountGroup.updateItem(ctx.request.body as AccountGroup)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /accountGroup/{id}:
     *      get:
     *          tags:
     *              - AccountGroup
     *          summary: Return accountGroup by ID
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
            const id: number = +ctx.params.id
            const relations = ['users', 'companies']

            ctx.body = await AccountGroup.getItem(id, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accountGroup:
     *      delete:
     *          tags:
     *              - AccountGroup
     *          summary: Delete a accountGroup.
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
     *              name: accountGroup
     *              description: The accountGroup to create.
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
     *                  description: accountGroup has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await AccountGroup.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /accountGroup:
     *      get:
     *          tags:
     *              - AccountGroup
     *          summary: Return accountGroup list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accountGroup
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            req_data.relations = ['users', 'companies']
            ctx.body = await AccountGroup.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

        /**
     *
     * @swagger
     * /accountGroupAccounts/{id}:
     *      get:
     *          tags:
     *              - AccountGroup
     *          summary: Return accountGroup with group by accounts
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
     *                  description: Array of accountGroup
     *              '401':
     *                  description: Unauthorized
     */
    public static async getGroupAccountsCounts (ctx: DefaultContext) {
        try {
            ctx.body = await AccountGroup.getGroupByAccounts(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
