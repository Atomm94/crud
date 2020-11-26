import { DefaultContext } from 'koa'
import { User } from '../model/entity/User'
export default class UserController {
    /**
     *
     * @swagger
     *  /user:
     *      post:
     *          tags:
     *              - User
     *          summary: Creates a user.
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
     *              name: user
     *              description: The user to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  email:
     *                      type: string
     *                  avatar:
     *                      type: string
     *                  password:
     *                      type: string
     *                  first_name:
     *                      type: string
     *                  last_name:
     *                      type: string
     *                  family_name:
     *                      type: string
     *                  verify_token:
     *                      type: string
     *                  phone:
     *                      type: string
     *                  company:
     *                      type: number
     *                  company_name:
     *                      type: string
     *                  role:
     *                      type: number
     *                  access_right:
     *                      type: number
     *                  user_group:
     *                      type: number
     *                  status:
     *                      type: string
     *                  last_login_date:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A user object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await User.addItem(ctx.request.body as User)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /user:
     *      put:
     *          tags:
     *              - User
     *          summary: Update a user.
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
     *              name: user
     *              description: The user to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  email:
     *                      type: string
     *                  avatar:
     *                      type: string
     *                  password:
     *                      type: string
     *                  first_name:
     *                      type: string
     *                  last_name:
     *                      type: string
     *                  family_name:
     *                      type: string
     *                  verify_token:
     *                      type: string
     *                  phone:
     *                      type: string
     *                  company:
     *                      type: number
     *                  company_name:
     *                      type: string
     *                  role:
     *                      type: number
     *                  access_right:
     *                      type: number
     *                  user_group:
     *                      type: number
     *                  status:
     *                      type: string
     *                  last_login_date:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A user updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await User.updateItem(ctx.request.body as User)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /user/{id}:
     *      get:
     *          tags:
     *              - User
     *          summary: Return user by ID
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
            ctx.body = await User.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /user:
     *      delete:
     *          tags:
     *              - User
     *          summary: Delete a user.
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
     *              name: user
     *              description: The user to create.
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
     *                  description: user has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await User.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /user:
     *      get:
     *          tags:
     *              - User
     *          summary: Return user list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of user
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await User.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
