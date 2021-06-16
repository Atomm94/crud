import { DefaultContext } from 'koa'
import { Acu } from '../model/entity/Acu'
import { timeValidation, networkValidation, checkAccessPointsValidation } from '../functions/validator'
import { acuStatus } from '../enums/acuStatus.enum'
import { AccessPoint } from '../model/entity/AccessPoint'
import { OperatorType } from '../mqtt/Operators'
import { Reader } from '../model/entity/Reader'
import { ExtDevice } from '../model/entity/ExtDevice'
import acuModels from '../model/entity/acuModels.json'
import SdlController from './Hardware/SdlController'
import DeviceController from './Hardware/DeviceController'
import CardKeyController from './Hardware/CardKeyController'
import RdController from './Hardware/RdController'
import ExtensionDeviceController from './Hardware/ExtensionDeviceController'
import CtpController from './Hardware/CtpController'
import { readerTypes } from '../enums/readerTypes'
import { logUserEvents } from '../enums/logUserEvents.enum'

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
     *                                          enable_buzzer:
     *                                              type: boolean
     *                                          enable_crc:
     *                                              type: boolean
     *                                          reverse_byte_order:
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

            const logs_data = []
            const check_time = timeValidation(req_data.time)
            if (!check_time) {
                ctx.status = 400
                return ctx.body = { message: check_time }
            }
            if (req_data.access_points) {
                const check_access_points = checkAccessPointsValidation(req_data.access_points, req_data.model, false)
                if (check_access_points !== true) {
                    ctx.status = 400
                    return ctx.body = { message: check_access_points }
                }
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
            logs_data.push({
                event: logUserEvents.CREATE,
                target: `${Acu.name}/${save_acu.name}`,
                value: null
            })

            if (req_data.access_points) {
                for (const access_point of req_data.access_points) {
                    access_point.acu = save_acu.id
                    access_point.company = acu.company
                    if (access_point.resources) access_point.resources = JSON.stringify(access_point.resources)
                    const save_access_point = await AccessPoint.addItem(access_point)
                    logs_data.push({
                        event: logUserEvents.CREATE,
                        target: `${AccessPoint.name}/${save_acu.name}/${save_access_point.name}`,
                        value: null
                    })
                    if (save_access_point) {
                        for (const reader of access_point.readers) {
                            reader.company = acu.company
                            reader.access_point = save_access_point.id
                            await Reader.addItem(reader)
                        }
                    }
                }
            }

            ctx.logsData = logs_data
            ctx.body = save_acu
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
     *                                          enable_buzzer:
     *                                              type: boolean
     *                                          enable_crc:
     *                                              type: boolean
     *                                          reverse_byte_order:
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

            const logs_data = []

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
                            DeviceController.setNetSettings(location, acu.serial_number, req_data, user.id, acu.session_id, true)
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
                            DeviceController.setDateTime(location, acu.serial_number, req_data, user.id, acu.session_id, true)
                            delete req_data.time
                        }
                        // else {
                        //     acu.network = JSON.stringify(req_data.network)
                        // }
                        // SendDevice.setDateTime(location, acu.serial_number, acu.session_id ? acu.session_id : '0', time)
                    }
                }

                const acu_updated = await Acu.updateItem(req_data as Acu)

                logs_data.push({
                    event: logUserEvents.CHANGE,
                    target: `${Acu.name}/${acu_updated.old.name}`,
                    value: acu_updated
                })

                if (req_data.access_points) {
                    const check_access_points = checkAccessPointsValidation(req_data.access_points, acu.model, true)
                    if (check_access_points !== true) {
                        ctx.status = 400
                        return ctx.body = { message: check_access_points }
                    } else {
                        if (acu.status === acuStatus.PENDING && req_data.access_points) {
                            ctx.status = 400
                            return ctx.body = { message: `You cant add accessPoints when acu status is ${acuStatus.PENDING}` }
                        }
                        const new_access_points: AccessPoint[] = []
                        for (let access_point of req_data.access_points) {
                            for (const resource in access_point.resources) {
                                const component_source: number = access_point.resources[resource].component_source
                                if (component_source !== 0) { // when component source is 0, so it is device
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
                                if (access_point.resource) access_point.resource = JSON.stringify(access_point.resource)

                                access_point = await AccessPoint.addItem(access_point)
                                logs_data.push({
                                    event: logUserEvents.CREATE,
                                    target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point.name}`,
                                    value: access_point
                                })
                                new_access_points.push(access_point)
                            } else {
                                const old_access_point = await AccessPoint.findOneOrFail({ id: access_point.id, company: company })
                                access_point.type = old_access_point.type
                            }

                            if (acu.status === acuStatus.ACTIVE) {
                                CtpController.setCtp(access_point.type, location, acu.serial_number, access_point, user.id, acu.session_id, access_point_update)
                            } else {
                                if (access_point_update) {
                                    const access_point_update = await AccessPoint.updateItem(access_point)
                                    logs_data.push({
                                        event: logUserEvents.CHANGE,
                                        target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point_update.old.name}`,
                                        value: access_point_update
                                    })
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
                                    logs_data.push({
                                        event: logUserEvents.CREATE,
                                        target: `${Reader.name}/${acu_updated.old.name}/${access_point.name}/${readerTypes[reader.type]}`,
                                        value: reader
                                    })
                                } else {
                                    const old_reader = await Reader.findOneOrFail({ id: reader.id, company: company })
                                    reader.access_point = old_reader.access_point
                                }

                                if (acu.status === acuStatus.ACTIVE) {
                                    reader.access_point_type = access_point.type
                                    RdController.setRd(location, acu.serial_number, reader, user.id, acu.session_id, reader_update)
                                } else {
                                    if (reader_update) {
                                        const reader_updated = await Reader.updateItem(reader)
                                        logs_data.push({
                                            event: logUserEvents.CHANGE,
                                            target: `${Reader.name}/${acu_updated.old.name}/${access_point.name}/${readerTypes[reader_updated.old.type]}`,
                                            value: reader_updated
                                        })
                                    }
                                }
                            }

                            // send CardKeys
                            if (new_access_points.length) {
                                CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user.id, new_access_points)
                            }
                        }
                    }
                }

                ctx.logsData = logs_data
                ctx.oldData = acu_updated.old
                ctx.body = acu_updated.new
            }
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
            const data = await Acu.createQueryBuilder('acu')
                .leftJoinAndSelect('acu.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                .leftJoinAndSelect('acu.ext_devices', 'ext_device', 'ext_device.delete_date is null')
                .where(`acu.id = ${+ctx.params.id}`)
                .andWhere(`acu.company = ${ctx.user.company}`)
                .getMany()
            if (!data.length) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = data[0]
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
            const logs_data = []
            const acu: Acu = await Acu.findOneOrFail(where)
            const location = `${user.company_main}/${user.company}`
            ctx.body = await Acu.destroyItem(where)
            logs_data.push({
                event: logUserEvents.DELETE,
                target: `${Acu.name}/${acu.name}`,
                value: null
            })
            ctx.logsData = logs_data
            if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                DeviceController.delDevice(OperatorType.CANCEL_REGISTRATION, location, acu.serial_number, acu, user.id, acu.session_id)
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

            const data = await Acu.createQueryBuilder('acu')
                .leftJoinAndSelect('acu.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                .where(`acu.company = ${ctx.user.company}`)
                .getMany()
            ctx.body = data
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
            const company = user.company ? user.company : null

            const device = await Acu.findOne({
                relations: [
                    'ext_devices',
                    'access_points',
                    'access_points.readers',
                    'access_points.access_rules',
                    'access_points.access_rules.schedules',
                    'access_points.access_rules.schedules.timeframes'
                ],
                where: {
                    id: req_data.device,
                    status: acuStatus.NO_HARDWARE,
                    company: company
                }
            })
            if (!device) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid device id!!'
                }
            }

            const hardware = await Acu.findOne({
                id: req_data.attached_hardware,
                status: acuStatus.PENDING,
                company: company
            })
            if (!hardware) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid device id!!'
                }
            }

            if (device.model !== hardware.model) {
                ctx.status = 400
                return ctx.body = {
                    message: 'device models are not same'
                }
            }

            device.status = acuStatus.ACTIVE
            device.network = hardware.network
            device.interface = hardware.interface
            device.serial_number = hardware.serial_number
            device.session_id = hardware.session_id
            // device.time = hardware.time
            const updated = await device.save()
            await Acu.destroyItem(hardware)
            ctx.body = updated

            const location = `${user.company_main}/${user.company}`

            // send extention Devices
            const ext_devices = device.ext_devices
            for (const ext_device of ext_devices) {
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
                ExtensionDeviceController.setExtBrd(location, device.serial_number, ext_device, user.id, device.session_id)
            }

            // send Access Points
            const access_points = device.access_points
            const access_point_update = false
            for (const access_point of access_points) {
                CtpController.setCtp(access_point.type, location, device.serial_number, access_point, user.id, device.session_id, access_point_update)
                // send Readers
                const readers: any = access_point.readers
                const reader_update = false
                for (const reader of readers) {
                    reader.access_point_type = access_point.type
                    RdController.setRd(location, device.serial_number, reader, user.id, device.session_id, reader_update)
                }

                // send Schedules(Access Rules)
                for (const access_rule of access_point.access_rules) {
                    SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, user.id, access_rule.access_points.acus.session_id)
                }

                // send CardKeys

                CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user.id, null, null, [device])
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
 *  /acu/activate/hardware:
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
 *              description: The acu to activate.
 *              schema:
 *                type: object
 *                required:
 *                 - hardware
 *                properties:
 *                  hardware:
 *                      type: number
 *                      example: 1
 *          responses:
 *              '201':
 *                  description: A acu object
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */

    public static async activateHardware (ctx: DefaultContext) {
        const req_data = ctx.request.body
        const user = ctx.user
        const company = user.company ? user.company : null
        const location = `${user.company_main}/${user.company}`

        const hardware = await Acu.findOne({
            where: {
                id: req_data.hardware,
                status: acuStatus.PENDING,
                company: company
            }
        })
        if (!hardware) {
            ctx.status = 400
            return ctx.body = {
                message: 'Invalid device id!!'
            }
        }
        hardware.status = acuStatus.ACTIVE
        await hardware.save()
        CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user.id, null, null, [hardware])
        return ctx.body = {
            message: 'success'
        }
    }
}
