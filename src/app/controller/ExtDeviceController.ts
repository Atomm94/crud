import { DefaultContext } from 'koa'
import { Acu } from '../model/entity/Acu'

import { acuStatus } from '../enums/acuStatus.enum'
import { ExtDevice } from '../model/entity/ExtDevice'
import acuModels from '../model/entity/acuModels.json'
import SendDeviceMessage from '../mqtt/SendDeviceMessage'
import { OperatorType } from '../mqtt/Operators'
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
     *                  ext_board:
     *                      type: string
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
            const req_data: any = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null

            req_data.company = company
            const ext_device: any = await ExtDevice.addItem(req_data as ExtDevice)
            ctx.body = ext_device
            const location = `${user.company_main}/${user.company}`
            const acu_models: any = acuModels
            const acu: Acu = await Acu.findOneOrFail({ id: req_data.acu })
            let inputs: Number, outputs: Number
            switch (req_data.ext_board) {
                case 'LR-RB16':
                    inputs = acu_models.expansion_boards.relay_board[req_data.ext_board].inputs
                    outputs = acu_models.expansion_boards.relay_board[req_data.ext_board].outputs
                    break
                case 'LR-IB16':
                    inputs = acu_models.expansion_boards.alarm_board[req_data.ext_board].inputs
                    outputs = acu_models.expansion_boards.alarm_board[req_data.ext_board].outputs
                    break
                default:
                    inputs = 0
                    outputs = 0
                    break
            }
            ext_device.resources = {
                input: inputs,
                output: outputs
            }
            if (acu.status === acuStatus.ACTIVE) {
                new SendDeviceMessage(OperatorType.SET_EXT_BRD, location, acu.serial_number, ext_device, acu.session_id)
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
            const req_data: any = ctx.request.body
            const user = ctx.user
            const location = `${user.company_main}/${user.company}`
            const acu: Acu = await Acu.findOneOrFail({ id: req_data.acu })
            if (acu.status === acuStatus.ACTIVE) {
                new SendDeviceMessage(OperatorType.SET_EXT_BRD, location, acu.serial_number, req_data, acu.session_id, true)
            } else if (acu.status === acuStatus.NO_HARDWARE) {
                ctx.body = await ExtDevice.updateItem(req_data)
            } else {
                ctx.status = 400
                ctx.body = { message: 'Activate ACU before changes' }
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
