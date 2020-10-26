import { DefaultContext } from 'koa'
import { Ticket } from '../model/entity/Ticket'
import { Message } from '../model/entity/Message'

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
     *                      type: JSON
     *                  status:
     *                      type: boolean
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
            ctx.body = await Ticket.addItem(ctx.request.body as Ticket)
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
     *                      type: JSON
     *                  status:
     *                      type: boolean
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
            const relations = ['departments']
            ctx.body = await Ticket.getItem(+ctx.params.id, relations)
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
            const req_data = ctx.query
            req_data.relations = ['departments']
            ctx.body = await Ticket.getAllItems(req_data)
        } catch (error) {
            console.log('error', error)

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
        const savedFile = Ticket.saveImage(file)
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
            Ticket.deleteImage(name)
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
     *          summary: Creates a message.
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
     *              name: message
     *              description: The message to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  text:
     *                      type: string
     *                  parent_id:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A message object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async addTicketMessage (ctx: DefaultContext) {
        try {
            ctx.body = await Message.addMessage(ctx.request.body as Message)
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
     *          summary: Update a message.
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
     *              name: message
     *              description: The message to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
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
     *                  description: A message updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateTicketMessage (ctx: DefaultContext) {
        try {
            ctx.body = await Message.updateMessage(ctx.request.body as Message)
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
     *          summary: Return message by ID
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
            ctx.body = await Message.getMessage(+ctx.params.id)
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
     *          summary: Delete a message.
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
     *              name: message
     *              description: The message to create.
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
     *                  description: message has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroyTicketMessage (ctx: DefaultContext) {
        try {
            ctx.body = await Message.destroyMessage(ctx.request.body as { id: number })
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
     *          summary: Return message list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of message
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAllTicketMessages (ctx: DefaultContext) {
        try {
            ctx.body = await Message.getAllMessages(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
