import { DefaultContext } from 'koa'
import { CameraIntegration } from '../cameraIntegration/deviceFactory'
import { CameraDevice } from '../model/entity/CameraDevice'
import { cameraType } from '../cameraIntegration/enums/deviceType.enum'
import { UniviewDeviceType } from '../cameraIntegration/enums/univiewDeviceType'
import { cameraDeviceConnType } from '../cameraIntegration/enums/camerDevice.enum'
import { cameraApiCodes } from '../cameraIntegration/enums/cameraApiCodes.enum'
import { Camera } from '../model/entity/Camera'

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

            if (Object.values(cameraDeviceConnType).indexOf(device.connection_type) === -1) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid connection type'
                }
            }
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
            CameraDeviceController.getCameraList(newDevice)
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
            if (req_data.port !== device.port || req_data.domain !== device.domain || req_data.username !== device.username || req_data.password !== device.password) {
                CameraDeviceController.getCameraList(data.new)
            }
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

    public static async destroy (ctx: DefaultContext) {
        try {
            const { id } = ctx.params
            const user = ctx.user
            const where = { id: id, company: user.company ? user.company : null }
            ctx.body = await CameraDevice.destroyItem(where)
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
     *            - name: id
     *              in: path
     *              required: true
     *              description: Parameter description
     *              schema:
     *                  type: integer
     *                  format: int64
     *                  minimum: 1
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
        try {
            const { id } = ctx.params
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
     *  /camera-device/livestream/{id}:
     *      get:
     *          tags:
     *              - Camera-device
     *          summary: Returns a camera device by id.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - name: id
     *              in: path
     *              required: true
     *              description: Parameter description
     *              schema:
     *                  type: integer
     *                  format: int64
     *                  minimum: 1
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

    public static async getLivestream (ctx: DefaultContext) {
        const { id } = ctx.params
        try {
            const device = await CameraDevice.findOneOrFail({ where: { id, company: ctx.user.company } })
            const livestream_url = await new CameraIntegration().deviceFactory(device, cameraApiCodes.CAMERASLIST)
            ctx.body = { url: livestream_url }
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    public static async getCameraList (device: CameraDevice, update: boolean = false) {
        try {
            if (update) {
                const cameras = await Camera.find({ where: { camera_device: device.id } })
                for (const camera of cameras) {
                    await Camera.destroyItem(camera)
                }
            }
            const cameraList = await new CameraIntegration().deviceFactory(device, cameraApiCodes.CAMERASLIST)
            const data = cameraList.Response.Data.DetailInfos
            for (const camera of data) {
                const save_data = {
                    service_id: camera.ID as number,
                    service_name: camera.Name,
                    channel_type: camera.ChannelType,
                    status: camera.Status,
                    stream_nums: camera.StreamNums,
                    device_type: camera.DeviceType,
                    allow_distribution: camera.AllowDistribution,
                    add_type: camera.AddType,
                    access_protocol: camera.AccessProtocol,
                    off_reason: camera.OffReason,
                    remote_index: camera.RemoteIndex,
                    manufacturer: camera.Manufacturer,
                    device_model: camera.DeviceModel,
                    gbid: camera.GBID,
                    address_info: camera.AddressInfo,
                    is_poe_port: camera.IsPoEPort,
                    poe_status: camera.PoEStatus,
                    camera_device: device.id,
                    company: device.company
                }
                await Camera.addItem(save_data as Camera)
            }
        } catch (err) {
            console.log('cameras insert error', err)
        }
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
            await new CameraIntegration().deviceFactory(device, cameraApiCodes.TEST)
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
