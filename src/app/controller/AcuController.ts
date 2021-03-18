import { DefaultContext } from 'koa'
import { Acu } from '../model/entity/Acu'
import { timeValidation, networkValidation, checkAccessPointsValidation } from '../functions/validator'
import { acuStatus } from '../enums/acuStatus.enum'
import { AccessPoint } from '../model/entity/AccessPoint'
import SendDeviceMessage from '../mqtt/SendDeviceMessage'
import { OperatorType } from '../mqtt/Operators'
import { Reader } from '../model/entity/Reader'
import { accessPointType } from '../enums/accessPointType.enum'
import { ExtDevice } from '../model/entity/ExtDevice'
import acuModels from '../model/entity/acuModels.json'

export default class AcuController {
    /**
     *
     * @swagger
     *  /acu:
     *      post:
     *          tags:
     *              - Acu
     *          summary: Creates a acu.
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
     *              name: acu
     *              description: The acu to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Door328 HUB
     *                  description:
     *                      type: string
     *                      example: some description
     *                  model:
     *                      type: string
     *                      example: LRM3CRS
     *                  shared_resource_mode:
     *                      type: boolean
     *                      example: false
     *                  time:
     *                      type: object
     *                      properties:
     *                          enable_daylight_saving_time:
     *                              type: boolean
     *                              example: false
     *                          timezone_from_facility:
     *                              type: boolean
     *                              example: false
     *                          time_zone:
     *                              type: string
     *                              example: +0
     *                          daylight_saving_time_from_user_account:
     *                              type: boolean
     *                              example: false
     *                  access_points:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              name:
     *                                  type: string
     *                                  example: Door328
     *                              description:
     *                                  type: string
     *                                  example: some_description
     *                              type:
     *                                  type: string
     *                                  example: door
     *                              actual_passage:
     *                                  type: boolean
     *                                  example: true
     *                              mode:
     *                                  type: N/A | credential | locked | unlocked | free_entry_block_exit | block_entry_free_exit
     *                                  example: credential
     *                              apb_enable_local:
     *                                  type: boolean
     *                                  example: true
     *                              apb_enable_timer:
     *                                  type: boolean
     *                                  example: true
     *                              access_point_group:
     *                                  type: number
     *                                  example: 1
     *                              access_point_zone:
     *                                  type: number
     *                                  example: 1
     *                              resources:
     *                                  type: object
     *                                  properties:
     *                              readers:
     *                                  type: array
     *                                  items:
     *                                      type: object
     *                                      properties:
     *                                          type:
     *                                              type: number
     *                                              example: '0'
     *                                          port:
     *                                              type: number
     *                                              example: 1
     *                                          wg_type:
     *                                              type: number
     *                                          mode:
     *                                              type: number
     *                                          direction:
     *                                              type: number
     *                                          beep:
     *                                              type: boolean
     *                                          crc:
     *                                              type: boolean
     *                                          reverse:
     *                                              type: boolean
     *          responses:
     *              '201':
     *                  description: A acu object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            req_data.company = user.company ? user.company : null
            // ctx.body = await Acu.addItem(req_data as Acu)

            const check_time = timeValidation(req_data.time)
            if (!check_time) {
                ctx.status = 400
                return ctx.body = { message: check_time }
            }

            const check_access_points = checkAccessPointsValidation(req_data.access_points, req_data.model, false)
            if (check_access_points !== true) {
                ctx.status = 400
                return ctx.body = { message: check_access_points }
            }

            const acu = new Acu()

            if ('name' in req_data) acu.name = req_data.name
            if ('description' in req_data) acu.description = req_data.description
            acu.model = req_data.model // check or no ??
            acu.status = acuStatus.NO_HARDWARE
            if ('shared_resource_mode' in req_data) acu.shared_resource_mode = req_data.shared_resource_mode
            acu.company = user.company ? user.company : null

            acu.time = JSON.stringify(req_data.time)
            const save_acu = await acu.save()

            if (req_data.access_points) {
                for (const access_point of req_data.access_points) {
                    access_point.acu = save_acu.id
                    access_point.company = acu.company
                    access_point.resources = JSON.stringify(access_point.resources)
                    const save_access_point = await AccessPoint.addItem(access_point)
                    if (save_access_point) {
                        for (const reader of access_point.readers) {
                            reader.company = acu.company
                            reader.access_point = save_access_point.id
                            await Reader.addItem(reader)
                        }
                    }
                }
            }

            ctx.body = save_acu
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
     *  /acu:
     *      put:
     *          tags:
     *              - Acu
     *          summary: Update a acu.
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
     *              name: acu
     *              description: The acu to create.
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
     *                      example: Door328 HUB
     *                  description:
     *                      type: string
     *                      example: some description
     *                  shared_resource_mode:
     *                      type: boolean
     *                      example: false
     *                  time:
     *                      type: object
     *                      properties:
     *                          enable_daylight_saving_time:
     *                              type: boolean
     *                              example: false
     *                          timezone_from_facility:
     *                              type: boolean
     *                              example: false
     *                          time_zone:
     *                              type: string
     *                              example: +0
     *                          daylight_saving_time_from_user_account:
     *                              type: boolean
     *                              example: false
     *                  access_points:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              id:
     *                                  type: number
     *                                  example: 1
     *                              name:
     *                                  type: string
     *                                  example: Door328
     *                              description:
     *                                  type: string
     *                                  example: some_description
     *                              actual_passage:
     *                                  type: boolean
     *                                  example: true
     *                              mode:
     *                                  type: N/A | credential | locked | unlocked | free_entry_block_exit | block_entry_free_exit
     *                                  example: credential
     *                              apb_enable_local:
     *                                  type: boolean
     *                                  example: true
     *                              apb_enable_timer:
     *                                  type: boolean
     *                                  example: true
     *                              access_point_group:
     *                                  type: number
     *                                  example: 1
     *                              access_point_zone:
     *                                  type: number
     *                                  example: 1
     *                              resources:
     *                                  type: object
     *                                  properties:
     *                              readers:
     *                                  type: array
     *                                  items:
     *                                      type: object
     *                                      properties:
     *                                          id:
     *                                              type: number
     *                                              example: 1
     *                                          port:
     *                                              type: number
     *                                              example: 1
     *                                          wg_type:
     *                                              type: number
     *                                          mode:
     *                                              type: number
     *                                          direction:
     *                                              type: number
     *                                          beep:
     *                                              type: boolean
     *                                          crc:
     *                                              type: boolean
     *                                          reverse:
     *                                              type: boolean
     *                  network:
     *                      type: object
     *                      properties:
     *                          fixed:
     *                              type: boolean
     *                              example: false
     *                          dhcp:
     *                              type: boolean
     *                              example: true
     *                          ip_address:
     *                              type: string
     *                              example: 192.168.99.232
     *                          gateway:
     *                              type: string
     *                              example: 255.255.255.0
     *                          subnet_mask:
     *                              type: string
     *                              example: 192.168.99.1
     *                          dns_server:
     *                              type: string
     *                              example: 192.168.99.1
     *                  interface:
     *                      type: object
     *                      properties:
     *                          rs485_port_1:
     *                              type: boolean
     *                          rs485_port_2:
     *                              type: boolean
     *          responses:
     *              '201':
     *                  description: A acu updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null
            const where = { id: req_data.id, company: company }
            const acu: Acu | undefined = await Acu.findOne(where)
            const location = `${user.company_main}/${user.company}`

            if (!acu) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                if (req_data.network && JSON.stringify(req_data.network) !== acu.network) {
                    const check_network = networkValidation(req_data.network)
                    if (!check_network) {
                        ctx.status = 400
                        return ctx.body = { message: check_network }
                    } else {
                        if (acu.status === acuStatus.ACTIVE) {
                            new SendDeviceMessage(OperatorType.SET_NET_SETTINGS, location, acu.serial_number, req_data, acu.session_id, true)
                            delete req_data.network
                        }
                        // else {
                        //     acu.network = JSON.stringify(req_data.network)
                        // }

                        // SendDevice.setNetSettings(`${user.company_main}/${user.company}`, acu.serial_number, acu.session_id ? acu.session_id : '0', network)
                    }
                }

                if (req_data.time && JSON.stringify(req_data.time) !== acu.time) {
                    const check_time = timeValidation(req_data.time)
                    if (!check_time) {
                        ctx.status = 400
                        return ctx.body = { message: check_time }
                    } else {
                        if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                            new SendDeviceMessage(OperatorType.SET_DATE_TIME, location, acu.serial_number, req_data, acu.session_id, true)
                            delete req_data.time
                        }
                        // else {
                        //     acu.network = JSON.stringify(req_data.network)
                        // }
                        // SendDevice.setDateTime(location, acu.serial_number, acu.session_id ? acu.session_id : '0', time)
                    }
                }

                const updated = await Acu.updateItem(req_data as Acu)

                if (req_data.access_points) {
                    const check_access_points = checkAccessPointsValidation(req_data.access_points, acu.model, true)
                    if (check_access_points !== true) {
                        ctx.status = 400
                        return ctx.body = { message: check_access_points }
                    } else {
                        for (let access_point of req_data.access_points) {
                            for (const resource in access_point.resources) {
                                const component_source: number = access_point.resources[resource].component_source
                                if (component_source !== 0) {
                                    const ext_device = await ExtDevice.findOne({ id: component_source, company: company })
                                    if (!ext_device) {
                                        ctx.status = 400
                                        return ctx.body = { message: `Invalid Component Source ${component_source}!` }
                                    }
                                }
                            }

                            let access_point_update = true
                            const readers = access_point.readers

                            if (!access_point.id) {
                                access_point_update = false
                                access_point.acu = acu.id
                                access_point.company = company
                                access_point = await AccessPoint.addItem(access_point)
                            } else {
                                const old_access_point = await AccessPoint.findOneOrFail({ id: access_point.id, company: company })
                                access_point.type = old_access_point.type
                            }

                            if (acu.status === acuStatus.ACTIVE) {
                                if (access_point.type === accessPointType.DOOR) {
                                    new SendDeviceMessage(OperatorType.SET_CTP_DOOR, location, acu.serial_number, access_point, acu.session_id, access_point_update)
                                }
                                //  else if (access_point.type === doorType.TURNSTILE) {
                                //     SendDevice.SetCtpTurnstile(location, acu.serial_number, acu.session_id, req_data)
                                // } else if (access_point.type === doorType.GATE) {
                                //     SendDevice.SetCtpGate(location, acu.serial_number, acu.session_id, req_data, schedule)
                                // } else if (access_point.type === doorType.GATEWAY) {
                                //     SendDevice.SetCtpGateWay(location, acu.serial_number, acu.session_id, req_data)
                                // } else if (access_point.type === doorType.FLOOR) {
                                //     SendDevice.SetCtpFloor(location, acu.serial_number, acu.session_id, req_data)
                                // }
                            } else {
                                if (access_point_update) {
                                    const access_point_update = await AccessPoint.updateItem(access_point)
                                    access_point = access_point_update.new
                                }
                            }

                            for (let reader of readers) {
                                let reader_update = true
                                if (!reader.id) {
                                    reader_update = false
                                    reader.access_point = access_point.id
                                    reader.company = company
                                    reader = await Reader.addItem(reader)
                                } else {
                                    const old_reader = await Reader.findOneOrFail({ id: reader.id, company: company })
                                    reader.access_point = old_reader.access_point
                                }

                                if (acu.status === acuStatus.ACTIVE) {
                                    reader.access_point_type = access_point.type
                                    new SendDeviceMessage(OperatorType.SET_RD, location, acu.serial_number, reader, acu.session_id, reader_update)
                                } else {
                                    if (reader_update) await Reader.updateItem(reader)
                                }
                            }
                        }
                    }
                }

                ctx.oldData = updated.old
                ctx.body = updated.new
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
     * /acu/{id}:
     *      get:
     *          tags:
     *              - Acu
     *          summary: Return acu by ID
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
            const where = { id: +ctx.params.id, company: user.company ? user.company : user.company }
            const acu: Acu = await Acu.getItem(where)
            const location = `${user.company_main}/${user.company}`
            new SendDeviceMessage(OperatorType.GET_STATUS_ACU, location, acu.serial_number, 'none', acu.session_id)
            // SendDevice.getStatusAcu(location, acu.serial_number, acu.session_id)
            ctx.body = acu
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /acu:
     *      delete:
     *          tags:
     *              - Acu
     *          summary: Delete a acu.
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
     *              name: acu
     *              description: The acu to create.
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
     *                  description: acu has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Acu.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await Acu.destroyItem(req_data as { id: number })
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
     * /acu:
     *      get:
     *          tags:
     *              - Acu
     *          summary: Return acu list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of acu
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await Acu.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /acu/models:
     *      get:
     *          tags:
     *              - Acu
     *          summary: Return acuModels list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: acuModels
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAcuModels (ctx: DefaultContext) {
        try {
            ctx.body = acuModels
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /acu/attach/hardware:
     *      get:
     *          tags:
     *              - Acu
     *          summary: Return acu list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of acu with pending status
     *              '401':
     *                  description: Unauthorized
     */
    public static async getDevicesForAttach (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = {
                company: { '=': user.company ? user.company : null },
                status: { '=': acuStatus.PENDING }
            }
            ctx.body = await Acu.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
 *
 * @swagger
 *  /acu/attach/hardware:
 *      post:
 *          tags:
 *              - Acu
 *          summary: Creates a acu.
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
 *              name: acu
 *              description: The acu to create.
 *              schema:
 *                type: object
 *                required:
 *                 - device
 *                 - attached_hardware
 *                properties:
 *                  device:
 *                      type: number
 *                      example: 1
 *                  attached_hardware:
 *                      type: number
 *                      example: 2
 *          responses:
 *              '201':
 *                  description: A acu object
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */

    public static async attachHardware (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const device = await Acu.findOneOrFail({
                id: req_data.device,
                status: acuStatus.NO_HARDWARE,
                company: user.company ? user.company : null
            })
            const hardware = await Acu.findOneOrFail({
                id: req_data.attached_hardware,
                status: acuStatus.PENDING,
                company: user.company ? user.company : null
            })
            if (device.model !== hardware.model) {
                ctx.status = 400
                ctx.body = {
                    message: 'device models are not same'
                }
            } else {
                device.status = acuStatus.ACTIVE
                device.network = hardware.network
                device.interface = hardware.interface
                // device.time = hardware.time
                const updated = await device.save()
                // await Acu.destroyItem({ id: hardware.id }) // accessPoints ??
                ctx.body = updated
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
