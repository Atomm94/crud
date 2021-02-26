import { DefaultContext } from 'koa'
import { ExtDevice } from '../model/entity/ExtDevice'
export default class ExtDeviceController {
    /**
     *
     * @swagger
     *  /extDevice:
     *      post:
     *          tags:
     *              - ExtDevice
     *          summary: Creates a extDevice.
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
     *              name: extDevice
     *              description: The extDevice to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  acu:
     *                      type: number
     *                  exp_brd:
     *                      type: LR-RB16 | LR-IB16
     *                      example: LR-RB16
     *                  baud_rate:
     *                      type: number
     *                  uart_mode:
     *                      type: number
     *                  address:
     *                      type: string
     *                  port:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A extDevice object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await ExtDevice.addItem(ctx.request.body as ExtDevice)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /extDevice:
     *      put:
     *          tags:
     *              - ExtDevice
     *          summary: Update a extDevice.
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
     *              name: extDevice
     *              description: The extDevice to create.
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
     *                  acu:
     *                      type: number
     *                  ext_board:
     *                      type: string
     *                  exp_brd:
     *                      type: LR-RB16 | LR-IB16
     *                      example: LR-RB16
     *                  baud_rate:
     *                      type: number
     *                  uart_mode:
     *                      type: number
     *                  address:
     *                      type: string
     *                  port:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A extDevice updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await ExtDevice.updateItem(ctx.request.body as ExtDevice)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /extDevice/{id}:
     *      get:
     *          tags:
     *              - ExtDevice
     *          summary: Return extDevice by ID
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
            ctx.body = await ExtDevice.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /extDevice:
     *      delete:
     *          tags:
     *              - ExtDevice
     *          summary: Delete a extDevice.
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
     *              name: extDevice
     *              description: The extDevice to create.
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
     *                  description: extDevice has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await ExtDevice.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /extDevice:
     *      get:
     *          tags:
     *              - ExtDevice
     *          summary: Return extDevice list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of extDevice
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await ExtDevice.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
