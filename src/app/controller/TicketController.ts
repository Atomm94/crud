import { DefaultContext } from 'koa'
import {
    Ticket,
    TicketMessage,
    Admin
} from '../model/entity/index'

export default class TicketController {
    /**
     *
     * @swagger
     *  /ticket:
     *      post:
     *          tags:
     *              - Ticket
     *          summary: Creates a ticket.
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
     *              name: ticket
     *              description: The ticket to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  department:
     *                      type: number
     *                  subject:
     *                      type: string
     *                  message:
     *                      type: string
     *                  image:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A ticket object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            req_data.user_id = ctx.user.id
            ctx.body = await Ticket.addItem(req_data as Ticket)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /ticket:
     *      put:
     *          tags:
     *              - Ticket
     *          summary: Update a ticket.
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
     *              name: ticket
     *              description: The ticket to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  department:
     *                      type: number
     *                  subject:
     *                      type: string
     *                  message:
     *                      type: string
     *                  image:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A ticket updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await Ticket.updateItem(ctx.request.body as Ticket)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /ticket/{id}:
     *      get:
     *          tags:
     *              - Ticket
     *          summary: Return ticket by ID
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
            const relations = ['user', 'departments', 'ticket_messages', 'ticket_messages.users']
            ctx.body = await Ticket.getItem(+ctx.params.id, user as Admin, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /ticket:
     *      delete:
     *          tags:
     *              - Ticket
     *          summary: Delete a ticket.
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
     *              name: ticket
     *              description: The ticket to create.
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
     *                  description: ticket has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await Ticket.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /ticket:
     *      get:
     *          tags:
     *              - Ticket
     *          summary: Return ticket list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of ticket
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const user = ctx.user
            const req_data = ctx.query
            req_data.relations = ['user', 'departments']
            ctx.body = await Ticket.getAllItems(req_data, user as Admin)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /ticketImage:
     *      post:
     *          tags:
     *              - Ticket
     *          summary: Upload ticket image.
     *          consumes:
     *              - multipart/form-data
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                    type: string
     *            - in: formData
     *              name: file
     *              type: file
     *              description: The upload ticket image.
     *          responses:
     *              '201':
     *                  description: image upload
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async saveImage (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = await Ticket.saveImage(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /ticketImage:
     *      delete:
     *          tags:
     *              - Ticket
     *          summary: Delete an ticket image.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *              type: string
     *            - in: body
     *              name: file
     *              description: The ticket image name to delete.
     *              schema:
     *                type: string
     *                required:
     *                  - name
     *                properties:
     *                  name:
     *                      type: string
     *          responses:
     *              '200':
     *                  description: Ticket image has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async deleteImage (ctx: DefaultContext) {
        const name = ctx.request.body.name

        try {
            await Ticket.deleteImage(name)
            ctx.body = {
                success: true
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
     *  /addTicketMessage:
     *      post:
     *          tags:
     *              - Ticket
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
     *                  text:
     *                      type: string
     *                  parent_id:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A ticketMessage object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async addTicketMessage (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            req_data.user_id = ctx.user.id
            ctx.body = await Ticket.addMessage(req_data as TicketMessage)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /updateTicketMessage:
     *      put:
     *          tags:
     *              - Ticket
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
     *                  - text
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  text:
     *                      type: string
     *                  parent_id:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A ticketMessage updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateTicketMessage (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            ctx.body = await Ticket.updateMessage(req_data as TicketMessage, user as Admin)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /getTicketMessage/{id}:
     *      get:
     *          tags:
     *              - Ticket
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
    public static async getTicketMessage (ctx: DefaultContext) {
        try {
            ctx.body = await Ticket.getMessage(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /destroyTicketMessage:
     *      delete:
     *          tags:
     *              - Ticket
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
    public static async destroyTicketMessage (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            ctx.body = await Ticket.destroyMessage(req_data as { id: number }, user as Admin)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /getAllTicketMessages:
     *      get:
     *          tags:
     *              - Ticket
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
    public static async getAllTicketMessages (ctx: DefaultContext) {
        try {
            ctx.body = await Ticket.getAllMessages(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
 *
 * @swagger
 *  /ticketMessageImage:
 *      post:
 *          tags:
 *              - Ticket
 *          summary: Upload Ticket Message image.
 *          consumes:
 *              - multipart/form-data
 *          parameters:
 *            - in: header
 *              name: Authorization
 *              required: true
 *              description: Authentication token
 *              schema:
 *                    type: string
 *            - in: formData
 *              name: file
 *              type: file
 *              description: The upload ticket message image.
 *          responses:
 *              '201':
 *                  description: image upload
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */
    public static async ticketMessageImageSave (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = await Ticket.saveMessageImage(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /ticketMessageImage:
     *      delete:
     *          tags:
     *              - Ticket
     *          summary: Delete a ticket message image.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *              type: string
     *            - in: body
     *              name: file
     *              description: The ticket message image name to delete.
     *              schema:
     *                type: string
     *                required:
     *                  - name
     *                properties:
     *                  name:
     *                      type: string
     *          responses:
     *              '200':
     *                  description: Ticket message image has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async ticketMessageImageDelete (ctx: DefaultContext) {
        const name = ctx.request.body.name

        try {
            await Ticket.deleteMessageImage(name)
            ctx.body = {
                success: true
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
