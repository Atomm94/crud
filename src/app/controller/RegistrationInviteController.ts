import { DefaultContext } from 'koa'
import { RegistrationInvite } from '../model/entity/RegistrationInvite'
import { PacketType } from '../model/entity/PacketType'

export default class RegistrationInviteController {
    /**
     *
     * @swagger
     *  /registrationInvite:
     *      post:
     *          tags:
     *              - RegistrationInvite
     *          summary: Creates a registrationInvite.
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
     *              name: registrationInvite
     *              description: The registrationInvite to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  email:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A registrationInvite object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await RegistrationInvite.createLink(ctx.request.body as RegistrationInvite)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    // /**
    //  *
    //  * @swagger
    //  *  /registrationInvite:
    //  *      put:
    //  *          tags:
    //  *              - RegistrationInvite
    //  *          summary: Update a registrationInvite.
    //  *          consumes:
    //  *              - application/json
    //  *          parameters:
    //  *            - in: header
    //  *              name: Authorization
    //  *              required: true
    //  *              description: Authentication token
    //  *              schema:
    //  *                type: string
    //  *            - in: body
    //  *              name: registrationInvite
    //  *              description: The registrationInvite to create.
    //  *              schema:
    //  *                type: object
    //  *                required:
    //  *                  - id
    //  *                properties:
    //  *                  id:
    //  *                      type: number
    //  *                      example: 1
    //  *                  email:
    //  *                      type: string
    //  *                  token:
    //  *                      type: string
    //  *                  used:
    //  *                      type: boolean
    //  *          responses:
    //  *              '201':
    //  *                  description: A registrationInvite updated object
    //  *              '409':
    //  *                  description: Conflict
    //  *              '422':
    //  *                  description: Wrong data
    //  */
    // public static async update (ctx: DefaultContext) {
    //     try {
    //         ctx.body = await RegistrationInvite.updateItem(ctx.request.body as RegistrationInvite)
    //     } catch (error) {
    //         ctx.status = error.status || 400
    //         ctx.body = error
    //     }
    //     return ctx.body
    // }

    /**
     *
     * @swagger
     * /registration/{token}:
     *      get:
     *          tags:
     *              - RegistrationInvite
     *          summary: Return registrationInvite by token
     *          parameters:
     *              - name: token
     *                in: path
     *                required: true
     *                description: Parameter description
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
            // ctx.body = await RegistrationInvite.getByLink(ctx.params.token)
            const token = ctx.params.token

            const regToken = await RegistrationInvite.findOneOrFail({ token: token, used: false })
            if (regToken) {
                const packetTypes = await PacketType.getAllItems({ where: { status: { '=': true } } })
                ctx.body = packetTypes
            } else {
                ctx.status = 400
                ctx.body = {
                    message: 'Wrong token!!'
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    // /**
    //  *
    //  * @swagger
    //  *  /registrationInvite:
    //  *      delete:
    //  *          tags:
    //  *              - RegistrationInvite
    //  *          summary: Delete a registrationInvite.
    //  *          consumes:
    //  *              - application/json
    //  *          parameters:
    //  *            - in: header
    //  *              name: Authorization
    //  *              required: true
    //  *              description: Authentication token
    //  *              schema:
    //  *                type: string
    //  *            - in: body
    //  *              name: registrationInvite
    //  *              description: The registrationInvite to create.
    //  *              schema:
    //  *                type: object
    //  *                required:
    //  *                  - id
    //  *                properties:
    //  *                  id:
    //  *                      type: number
    //  *                      example: 1
    //  *          responses:
    //  *              '200':
    //  *                  description: registrationInvite has been deleted
    //  *              '422':
    //  *                  description: Wrong data
    //  */
    // public static async destroy (ctx: DefaultContext) {
    //     try {
    //         ctx.body = await RegistrationInvite.destroyItem(ctx.request.body as { id: number })
    //     } catch (error) {
    //         ctx.status = error.status || 400
    //         ctx.body = error
    //     }
    //     return ctx.body
    // }

    // /**
    //  *
    //  * @swagger
    //  * /registrationInvite:
    //  *      get:
    //  *          tags:
    //  *              - RegistrationInvite
    //  *          summary: Return registrationInvite list
    //  *          parameters:
    //  *              - in: header
    //  *                name: Authorization
    //  *                required: true
    //  *                description: Authentication token
    //  *                schema:
    //  *                    type: string
    //  *          responses:
    //  *              '200':
    //  *                  description: Array of registrationInvite
    //  *              '401':
    //  *                  description: Unauthorized
    //  */
    // public static async getAll (ctx: DefaultContext) {
    //     try {
    //         ctx.body = await RegistrationInvite.getAllItems(ctx.query)
    //     } catch (error) {
    //         ctx.status = error.status || 400
    //         ctx.body = error
    //     }
    //     return ctx.body
    // }
}
