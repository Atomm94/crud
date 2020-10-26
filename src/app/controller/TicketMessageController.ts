import { DefaultContext } from 'koa'
import { TicketMessage } from '../model/entity/TicketMessage'
export default class TicketMessageController {
    /**
     *
     * @swagger
     *  /ticketMessage:
     *      post:
     *          tags:
     *              - TicketMessage
     *          summary: Creates a ticketMessage.
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
     *              name: ticketMessage
     *              description: The ticketMessage to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  ticket_id:
     *                      type: number
     *                  user_id:
     *                      type: number
     *                  message_id:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A ticketMessage object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await TicketMessage.addItem(ctx.request.body as TicketMessage)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /ticketMessage:
     *      put:
     *          tags:
     *              - TicketMessage
     *          summary: Update a ticketMessage.
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
     *              name: ticketMessage
     *              description: The ticketMessage to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  ticket_id:
     *                      type: number
     *                  user_id:
     *                      type: number
     *                  message_id:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A ticketMessage updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await TicketMessage.updateItem(ctx.request.body as TicketMessage)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /ticketMessage/{id}:
     *      get:
     *          tags:
     *              - TicketMessage
     *          summary: Return ticketMessage by ID
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
            ctx.body = await TicketMessage.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /ticketMessage:
     *      delete:
     *          tags:
     *              - TicketMessage
     *          summary: Delete a ticketMessage.
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
     *              name: ticketMessage
     *              description: The ticketMessage to create.
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
     *                  description: ticketMessage has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await TicketMessage.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /ticketMessage:
     *      get:
     *          tags:
     *              - TicketMessage
     *          summary: Return ticketMessage list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of ticketMessage
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await TicketMessage.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
