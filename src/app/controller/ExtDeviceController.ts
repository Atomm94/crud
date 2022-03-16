import { DefaultContext } from 'koa'
import { Acu } from '../model/entity/Acu'

import { acuStatus } from '../enums/acuStatus.enum'
import { ExtDevice } from '../model/entity/ExtDevice'
import acuModels from '../model/entity/acuModels.json'
import ExtensionDeviceController from './Hardware/ExtensionDeviceController'
import { checkExtDeviceValidation } from '../functions/validator'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { checkSendingDevice } from '../functions/check-sending-device'
import { locationGenerator } from '../functions/locationGenerator'

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
     *                      example: LR-RB16.001
     *                  acu:
     *                      type: number
     *                      example: 1
     *                  ext_board:
     *                      type: string
     *                      enum: [LR-RB16, LR-IB16]
     *                      example: LR-RB16
     *                  interface:
     *                      type: number
     *                      enum: [0, 1]
     *                      example: 0
     *                  baud_rate:
     *                      type: string
     *                      enum: [2400, 9600, 19200, 28800, 38400, 57600]
     *                      example: 2400
     *                  address:
     *                      type: string
     *                      example: 12
     *                  port:
     *                      type: number
     *                      example: 1
     *                  protocol:
     *                      type: string
     *                      enum: [OSDP, OSDPe, default]
     *                      example: OSDP
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

            const check_ext_device = checkExtDeviceValidation(req_data)
            if (check_ext_device !== true) {
                ctx.status = 400
                return ctx.body = { message: check_ext_device }
            }

            const acu: Acu = await Acu.findOneOrFail({ id: req_data.acu, company: company })
            if (acu.status === acuStatus.PENDING) {
                ctx.status = 400
                return ctx.body = { message: `You cant add extentionDevice when acu status is ${acuStatus.PENDING}` }
            }

            req_data.company = company
            const ext_device = await ExtDevice.addItem(req_data as ExtDevice)
            ctx.body = ext_device
            const location = await locationGenerator(user)
            const acu_models: any = acuModels
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
                ExtensionDeviceController.setExtBrd(location, acu.serial_number, ext_device, user, acu.session_id)
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
     *                      example: LR-RB16.001
     *                  acu:
     *                      type: number
     *                      example: 1
     *                  ext_board:
     *                      type: string
     *                      enum: [LR-RB16, LR-IB16]
     *                      example: LR-RB16
     *                  interface:
     *                      type: number
     *                      enum: [0, 1]
     *                      example: 0
     *                  baud_rate:
     *                      type: string
     *                      enum: [2400, 9600, 19200, 28800, 38400, 57600]
     *                      example: 2400
     *                  address:
     *                      type: string
     *                      example: 12
     *                  port:
     *                      type: number
     *                      example: 1
     *                  protocol:
     *                      type: string
     *                      enum: [OSDP, OSDPe, default]
     *                      example: OSDP
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
            const location = await locationGenerator(user)

            const check_ext_device = checkExtDeviceValidation(req_data)
            if (check_ext_device !== true) {
                ctx.status = 400
                return ctx.body = { message: check_ext_device }
            }

            const extDevice: ExtDevice = await ExtDevice.findOneOrFail(req_data.id)
            const acu: Acu = await Acu.findOneOrFail({ id: extDevice.acu })

            if (acu.status === acuStatus.ACTIVE) {
                const checkExtDeviceSend = checkSendingDevice(extDevice, req_data, ExtDevice.fields_that_used_in_sending, ExtDevice.required_fields_for_sending)
                if (checkExtDeviceSend) {
                    ExtensionDeviceController.setExtBrd(location, acu.serial_number, checkExtDeviceSend, user, acu.session_id, true)
                    ctx.body = { message: 'Update pending' }
                    ctx.logsData = []
                } else {
                    const update = await ExtDevice.updateItem(req_data)
                    ctx.oldData = update.old
                    ctx.body = update.new
                }
            } else if (acu.status === acuStatus.NO_HARDWARE) {
                const update = await ExtDevice.updateItem(req_data)
                ctx.oldData = update.old
                ctx.body = update.new
            } else {
                ctx.status = 400
                ctx.body = { message: 'Activate ACU before changes' }
            }
        } catch (error) {
            console.log(error)

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
            const ext_device: ExtDevice = await ExtDevice.findOneOrFail({ id: ctx.request.body.id })
            const req_data: any = ctx.request.body
            const user = ctx.user
            const logs_data = []
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const location = await locationGenerator(user)
            const acu: Acu = await Acu.findOneOrFail({ id: ext_device.acu })
            if (acu.status === acuStatus.ACTIVE) {
                ExtensionDeviceController.delExtBrd(location, acu.serial_number, req_data, user, acu.session_id)
                ctx.body = { message: 'Destroy pending' }
            } else {
                ctx.body = await ExtDevice.destroyItem(where)
                logs_data.push({
                    event: logUserEvents.DELETE,
                    target: `${ExtDevice.name}/${ext_device.name}`,
                    value: { name: ext_device.name }
                })
            }
            ctx.logsData = logs_data
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
     *              - in: query
     *                name: acu
     *                description: acu
     *                required : true
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
            const req_data = ctx.query
            const user = ctx.user
            const acu = ctx.query.acu
            req_data.where = { acu: { '=': acu }, company: { '=': user.company } }

            ctx.body = await ExtDevice.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
