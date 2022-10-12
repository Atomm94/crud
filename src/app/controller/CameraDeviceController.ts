import { DefaultContext } from 'koa'
import { CameraDevice } from '../model/entity/CameraDevice'

export default class CameraDeviceController {
    /**
     *
     * @swagger
     *  /camera-device:
     *      post:
     *          tags:
     *              - Camera-device
     *          summary: Creates a camera device.
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
     *              name: camera device
     *              description: The camera device to create.
     *              schema:
     *                type: object
     *                required:
     *                  - name
     *                  - connection_type
     *                  - username
     *                  - password
     *                properties:
     *                  name:
     *                      type: string
     *                      example: NVC
     *                  connection_type:
     *                      type: string
     *                      enum: [IP/Domain, Cloud]
     *                      example: Cloud
     *                  serial_number:
     *                      type: string
     *                      example: 35453sdaf35
     *                  domain:
     *                      type: string
     *                      example: api.example.com
     *                  port:
     *                      type: number
     *                      example: 80
     *                  username:
     *                      type: string
     *                      example: user123456
     *                  password:
     *                      type: string
     *                      example: password123
     *          responses:
     *              '201':
     *                  description: A camera device object
     *              '500':
     *                  description: Some server error with description message
     */
    public static async add (ctx: DefaultContext) {
        const device = ctx.request.body
        try {
            if (device.connection_type === 'IP/Domain') {
                if (device.serial_number) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Parameters doesn\'t match'
                    }
                }
                if (!device.port || !device.domain) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Not enough information'
                    }
                }
            }
            if (device.connection_type === 'Cloud') {
                if (device.domain || device.port) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Parameters doesn\'t match'
                    }
                }
                if (!device.serial_number) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Not enough information'
                    }
                }
            }
            const newDevice = await CameraDevice.addItem({
                company: ctx.user.company,
                ...ctx.request.body
            })
            ctx.status = 201
            ctx.body = {
                message: 'Device was successfully added',
                data: newDevice
            }
        } catch (err) {
            ctx.status = err.status || 500
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-device:
     *      put:
     *          tags:
     *              - Camera-device
     *          summary: Updates the camera device.
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
     *              name: camera device
     *              description: The camera device to update.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 5
     *                  name:
     *                      type: string
     *                      example: NVC
     *                  connection_type:
     *                      type: string
     *                      enum: [IP/Domain, Cloud]
     *                      example: Cloud
     *                  serial_number:
     *                      type: string
     *                      example: 35453sdaf35
     *                  domain:
     *                      type: string
     *                      example: api.example.com
     *                  port:
     *                      type: number
     *                      example: 80
     *                  username:
     *                      type: string
     *                      example: user123456
     *                  password:
     *                      type: string
     *                      example: password123
     *          responses:
     *              '200':
     *                  description: A camera device object
     *              '400':
     *                  description: Validation errors
     *              '500':
     *                  description: Some server error with description message
     */

    public static async update (ctx: DefaultContext) {
        const device = ctx.request.body
        try {
            if (device.connection_type === 'IP/Domain') {
                device.serial_number = null
                if (device.serial_number) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Parameters doesn\'t match'
                    }
                }
                if (!device.port || !device.domain) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Not enough information'
                    }
                }
            }
            if (device.connection_type === 'Cloud') {
                device.port = null
                device.domain = null
                if (device.domain || device.port) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Parameters doesn\'t match'
                    }
                }
                if (!device.serial_number) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Not enough information'
                    }
                }
            }
            const data = await CameraDevice.updateItem(ctx.request.body)
            ctx.body = {
                data: data.new
            }
        } catch (err) {
            ctx.status = err.status || 500
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-device/{id}:
     *      delete:
     *          tags:
     *              - Camera-device
     *          summary: Deletes the camera device.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *            - in: path
     *              name: camera device id
     *              type: string
     *          responses:
     *              '200':
     *                  description: Device was successfully deleted
     *              '500':
     *                  description: Some server error with description message
     */

    public static async delete (ctx: DefaultContext) {
        const { id } = ctx.params
        try {
            await CameraDevice.delete({ id })
            ctx.body = {
                message: 'Device was successfully deleted'
            }
        } catch (err) {
            ctx.status = err.status || 500
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-device:
     *      get:
     *          tags:
     *              - Camera-device
     *          summary: Returns all the camera devices.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *          responses:
     *              '200':
     *                  description: Array of device objects
     *              '500':
     *                  description: Some server error with description message
     */

    public static async getAll (ctx: DefaultContext) {
        const { id: companyId } = ctx.user.companyData
        console.log(companyId)
        try {
            const devices = await CameraDevice.find({ company: companyId })
            ctx.body = {
                data: devices
            }
        } catch (err) {
            ctx.status = err.status || 500
            ctx.body = err
        }
        return ctx.body
    }

    public static async get (ctx: DefaultContext) {
        const { id } = ctx.params
        try {
            const device = await CameraDevice.findOne({ id })
            ctx.body = {
                data: device
            }
        } catch (err) {
            ctx.status = err.status || 500
            ctx.body = err
        }
        return ctx.body
    }
}
