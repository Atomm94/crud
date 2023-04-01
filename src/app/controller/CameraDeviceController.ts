import { DefaultContext } from 'koa'
import { CameraIntegration } from '../cameraIntegration/deviceFactory'
import { CameraDevice } from '../model/entity/CameraDevice'
import { cameraType } from '../cameraIntegration/enums/deviceType.enum'
import { UniviewDeviceType } from '../cameraIntegration/enums/univiewDeviceType'
import { cameraDeviceConnType } from '../cameraIntegration/enums/camerDevice.enum'

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
     *                  device_type:
     *                      type: string
     *                      enum: [nvr, ipc]
     *                      example: nvr
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
     *              '400':
     *                  description: Some server error with description message
     */
    public static async add (ctx: DefaultContext) {
        const device = ctx.request.body
        try {
            const user = ctx.user
            const company = user.company ? user.company : null

            device.company = company
            if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
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
            if (Object.values(UniviewDeviceType).indexOf(device.device_type) === -1) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid device type'
                }
            }
            if (device.connection_type === cameraDeviceConnType.CLOUD) {
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
            const newDevice = await CameraDevice.addItem(device as CameraDevice)
            ctx.status = 200
            ctx.body = newDevice
        } catch (err) {
            ctx.status = err.status || 400
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
     *                  device_type:
     *                      type: string
     *                      enum: [nvr, ipc]
     *                      example: nvr
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
     */

    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const device = await CameraDevice.findOneOrFail({ where: { id: req_data.id, company: ctx.user.company } })
            if (device.connection_type !== req_data.connection_type) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Can\'t update device connection type'
                }
            }
            if (req_data.connection_type === cameraDeviceConnType.IP_DOMAIN) {
                if (!req_data.port || !req_data.domain) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Not enough information'
                    }
                }
            }
            if (Object.values(UniviewDeviceType).indexOf(req_data.device_type) === -1) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid device type'
                }
            }
            if (req_data.connection_type === cameraDeviceConnType.CLOUD) {
                if (!req_data.serial_number) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Not enough information'
                    }
                }
            }
            const data = await CameraDevice.updateItem(req_data)
            ctx.oldData = data.old
            ctx.body = data.new
        } catch (err) {
            ctx.status = err.status || 400
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
     *              '400':
     *                  description: Some server error with description message
     */

    public static async delete (ctx: DefaultContext) {
        const { id } = ctx.params
        try {
            const cameraDevice = await CameraDevice.findOneOrFail({ where: { id: id, company: ctx.user.company } })
            await CameraDevice.softRemove([cameraDevice])
            ctx.body = {
                message: 'Device was successfully deleted'
            }
        } catch (err) {
            ctx.status = err.status || 400
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
     *              '400':
     *                  description: Some server error with description message
     */

    public static async getAll (ctx: DefaultContext) {
        try {
            const company = ctx.user.company
            const devices = await CameraDevice.find({ company: company })
            ctx.body = devices
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-device/{id}:
     *      get:
     *          tags:
     *              - Camera-device
     *          summary: Returns a camera device by id.
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
     *                  description: Camera device object
     *              '400':
     *                  description: Some server error with description message
     */

    public static async get (ctx: DefaultContext) {
        const { id } = ctx.params
        try {
            const device = await CameraDevice.findOneOrFail({ where: { id, company: ctx.user.company } })
            ctx.body = device
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
 *
 * @swagger
 *  /camera-device/test:
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
 *                  - id
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
 *                  device_type:
 *                      type: string
 *                      enum: [nvr, ipc]
 *                      example: nvr
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
 *              '400':
 *                  description: Some server error with description message
 */
    public static async testDevice (ctx: DefaultContext) {
        const device = ctx.request.body
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
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

        if (Object.values(UniviewDeviceType).indexOf(device.device_type) === -1) {
            ctx.status = 400
            return ctx.body = {
                message: 'Invalid device type'
            }
        }
        if (device.connection_type === cameraDeviceConnType.CLOUD) {
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
        try {
            device.type = cameraType.UNIVIEW
            await new CameraIntegration().deviceFactory(device)
            ctx.status = 200
            ctx.body = {
                message: 'Test OK'
            }
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = {
                message: 'Test failed',
                data: err.message
            }
        }
        return ctx.body
    }
}
