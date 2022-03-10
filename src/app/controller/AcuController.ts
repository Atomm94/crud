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
import { accessPointMode } from '../enums/accessPointMode.enum'
import { checkSendingDevice } from '../functions/check-sending-device'
import { AccessPointZone } from '../model/entity'

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
     *                  elevator_mode:
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
     *                                          leaving_zone:
     *                                              type: number
     *                                          came_to_zone:
     *                                              type: number
     *                  readers:
     *                      type: object
     *                      properties:
     *                          type:
     *                              type: number
     *                              example: '0'
     *                          port:
     *                              type: number
     *                              example: 1
     *                          wg_type:
     *                              type: number
     *                          mode:
     *                              type: number
     *                          direction:
     *                              type: number
     *                          enable_buzzer:
     *                              type: boolean
     *                          enable_crc:
     *                              type: boolean
     *                          reverse_byte_order:
     *                              type: boolean
     *                          leaving_zone:
     *                              type: number
     *                          came_to_zone:
     *                              type: number
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
            let acu_reader = req_data.readers
            if (acu_reader) {
                acu_reader.company = req_data.company
                acu_reader = await Reader.addItem(acu_reader)
            }
            if (req_data.access_points) {
                const acu_reader_id = acu_reader ? acu_reader.id : 0
                const check_access_points = checkAccessPointsValidation(req_data.access_points, req_data.model, req_data.elevator_mode, acu_reader_id, false)
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
            if ('elevator_mode' in req_data) acu.elevator_mode = req_data.elevator_mode
            acu.company = user.company ? user.company : null
            if (acu_reader) acu.reader = acu_reader.id

            acu.time = JSON.stringify(req_data.time)
            const save_acu = await acu.save()
            logs_data.push({
                event: logUserEvents.CREATE,
                target: `${Acu.name}/${save_acu.name}`,
                value: { name: save_acu.name }
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
                        value: { name: save_access_point.name }
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
            console.log('error', error)

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
     *                  elevator_mode:
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
     *                                          osdp_data:
     *                                              type: object
     *                                              properties:
     *                                                  baud_rate:
     *                                                      type: string
     *                                                  card_data_format_flags:
     *                                                      type: string
     *                                                  keypad_mode:
     *                                                      type: string
     *                                                  configuration:
     *                                                      type: string
     *                                                  led_mode:
     *                                                      type: string
     *                                                  offline_mode:
     *                                                      type: string
     *                                                  enable_osdp_secure_channel:
     *                                                      type: boolean
     *                                                  enable_osdp_tracing:
     *                                                      type: boolean
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
     *                                          leaving_zone:
     *                                              type: number
     *                                          came_to_zone:
     *                                              type: number
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
     *                  readers:
     *                      type: object
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          type:
     *                              type: number
     *                              example: '0'
     *                          port:
     *                              type: number
     *                              example: 1
     *                          wg_type:
     *                              type: number
     *                          mode:
     *                              type: number
     *                          direction:
     *                              type: number
     *                          enable_buzzer:
     *                              type: boolean
     *                          enable_crc:
     *                              type: boolean
     *                          reverse_byte_order:
     *                              type: boolean
     *                          leaving_zone:
     *                              type: number
     *                          came_to_zone:
     *                              type: number
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
                if (req_data.network) {
                    const checkNetworkSend = checkSendingDevice(acu.network, req_data.network)
                    if (checkNetworkSend) {
                        const check_network = networkValidation(req_data.network)
                        if (!check_network) {
                            ctx.status = 400
                            return ctx.body = { message: check_network }
                        } else {
                            if (acu.status === acuStatus.ACTIVE) {
                                DeviceController.setNetSettings(location, acu.serial_number, req_data, user, acu.session_id, true)
                                delete req_data.network
                            }
                            // else {
                            //     acu.network = JSON.stringify(req_data.network)
                            // }

                            // SendDevice.setNetSettings(`${user.company_main}/${user.company}`, acu.serial_number, acu.session_id ? acu.session_id : '0', network)
                        }
                    }
                }

                if (req_data.time) {
                    const checkDateTimeSend = checkSendingDevice(acu.time, req_data.time)
                    if (checkDateTimeSend) {
                        const check_time = timeValidation(req_data.time)
                        if (!check_time) {
                            ctx.status = 400
                            return ctx.body = { message: check_time }
                        } else {
                            if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                                DeviceController.setDateTime(location, acu.serial_number, checkDateTimeSend, user, acu.session_id, true)
                                delete req_data.time
                            }
                            // else {
                            //     acu.network = JSON.stringify(req_data.network)
                            // }
                            // SendDevice.setDateTime(location, acu.serial_number, acu.session_id ? acu.session_id : '0', time)
                        }
                    }
                }

                const acu_updated = await Acu.updateItem(req_data as Acu)

                logs_data.push({
                    event: logUserEvents.CHANGE,
                    target: `${Acu.name}/${acu_updated.old.name}`,
                    value: acu_updated
                })

                let acu_reader = req_data.readers
                let acuReaderSend = false

                if (req_data.access_points) {
                    const check_access_points = checkAccessPointsValidation(req_data.access_points, acu.model, acu.elevator_mode, acu.reader, true)
                    if (check_access_points !== true) {
                        ctx.status = 400
                        return ctx.body = { message: check_access_points }
                    } else {
                        if (acu.status === acuStatus.PENDING && req_data.access_points && req_data.access_points.length) {
                            ctx.status = 400
                            return ctx.body = { message: `You cant add accessPoints when acu status is ${acuStatus.PENDING}` }
                        }
                        // const new_access_points: AccessPoint[] = [] // for sending Set(Add)CardKey
                        let access_point_ind = 0
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

                            let checkAccessPointSend: any = false
                            if (!access_point.id) {
                                if (acu.elevator_mode) acuReaderSend = true
                                access_point_update = false
                                access_point.acu = acu.id
                                access_point.company = company
                                if (access_point.resource) access_point.resource = JSON.stringify(access_point.resource)
                                access_point.mode = accessPointMode.CREDENTIAL

                                let access_point_zone
                                if (access_point.access_point_zone) {
                                    access_point_zone = await AccessPointZone.findOne({ where: { id: access_point.access_point_zone }, relations: ['antipass_backs'] })
                                }
                                access_point = await AccessPoint.addItem(access_point)
                                // new_access_points.push(access_point)
                                req_data.access_points[access_point_ind] = access_point

                                access_point.access_point_zones = access_point_zone
                            } else {
                                const old_access_point = await AccessPoint.findOneOrFail({ id: access_point.id, company: company })
                                const type = old_access_point.type
                                access_point.type = type
                                checkAccessPointSend = checkSendingDevice(old_access_point, access_point, AccessPoint.fields_that_used_in_sending, AccessPoint.required_fields_for_sending)
                                const checkAccessPointResourcesSend = checkSendingDevice(old_access_point.resources, access_point.resources)
                                if (checkAccessPointResourcesSend) {
                                    if (checkAccessPointSend) {
                                        checkAccessPointSend.resourcesForSendDevice = checkAccessPointResourcesSend
                                        checkAccessPointSend.resources = access_point.resources
                                    } else {
                                        checkAccessPointSend = {
                                            id: access_point.id,
                                            type,
                                            resourcesForSendDevice: checkAccessPointResourcesSend,
                                            resources: access_point.resources
                                        }
                                    }
                                }

                                if (access_point.access_point_zone !== old_access_point.access_point_zone) {
                                    let access_point_zone: any = -1
                                    if (access_point.access_point_zone) {
                                        access_point_zone = await AccessPointZone.findOne({ where: { id: access_point.access_point_zone }, relations: ['antipass_backs'] })
                                    }
                                    if (!access_point_zone) access_point_zone = -1
                                    if (checkAccessPointSend) {
                                        checkAccessPointSend.access_point_zones = access_point_zone
                                    } else {
                                        checkAccessPointSend = {
                                            id: access_point.id,
                                            type,
                                            access_point_zone: access_point.access_point_zone,
                                            access_point_zones: access_point_zone
                                        }
                                    }
                                }
                            }

                            if (acu.status === acuStatus.ACTIVE) {
                                if (access_point_update) {
                                    if (checkAccessPointSend) {
                                        CtpController.setCtp(access_point.type, location, acu.serial_number, checkAccessPointSend, user, acu.session_id, access_point_update)
                                    } else {
                                        const access_point_update = await AccessPoint.updateItem(access_point)
                                        logs_data.push({
                                            event: logUserEvents.CHANGE,
                                            target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point_update.old.name}`,
                                            value: access_point_update
                                        })
                                        access_point = access_point_update.new
                                    }
                                } else {
                                    CtpController.setCtp(access_point.type, location, acu.serial_number, access_point, user, acu.session_id, access_point_update)
                                }
                            } else {
                                if (access_point_update) {
                                    const access_point_update = await AccessPoint.updateItem(access_point)
                                    logs_data.push({
                                        event: logUserEvents.CHANGE,
                                        target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point_update.old.name}`,
                                        value: access_point_update
                                    })
                                    access_point = access_point_update.new
                                } else {
                                    logs_data.push({
                                        event: logUserEvents.CREATE,
                                        target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point.name}`,
                                        value: access_point
                                    })
                                }
                            }

                            const set_rd_data: any = []
                            let readersSend = false
                            for (let reader of readers) {
                                let checkReaderSend: any = false
                                let reader_update = true
                                if (!reader.id) {
                                    readersSend = true
                                    reader_update = false
                                    reader.access_point = access_point.id
                                    reader.company = company
                                    reader = await Reader.addItem(reader)
                                } else {
                                    const old_reader = await Reader.findOneOrFail({ id: reader.id, company: company })
                                    reader.access_point = old_reader.access_point
                                    checkReaderSend = checkSendingDevice(old_reader, reader, Reader.fields_that_used_in_sending, Reader.required_fields_for_sending)
                                    const checkReaderOSDPDataSend = checkSendingDevice(old_reader.osdp_data, reader.osdp_data, Reader.OSDP_fields_that_used_in_sending)
                                    if (checkReaderSend) {
                                        readersSend = true
                                        if (checkReaderOSDPDataSend) checkReaderSend.osdp_data = checkReaderOSDPDataSend
                                    } else {
                                        if (checkReaderOSDPDataSend) {
                                            readersSend = true
                                            checkReaderSend = { id: reader.id, osdp_data: checkReaderOSDPDataSend }
                                            for (const required_field of Reader.required_fields_for_sending) {
                                                if (required_field in reader) checkReaderSend[required_field] = reader[required_field]
                                            }
                                        }
                                    }
                                    if (checkReaderSend) reader = checkReaderSend
                                }

                                if (acu.status === acuStatus.ACTIVE) {
                                    reader.access_point_type = access_point.type
                                    set_rd_data.push({ ...reader, update: reader_update })
                                    if (!checkReaderSend) {
                                        const reader_updated = await Reader.updateItem(reader)
                                        logs_data.push({
                                            event: logUserEvents.CHANGE,
                                            target: `${Reader.name}/${acu_updated.old.name}/${access_point.name}/${readerTypes[reader_updated.old.type]}`,
                                            value: reader_updated
                                        })
                                    }
                                    // RdController.setRd(location, acu.serial_number, readers, user, acu.session_id, reader_update)
                                } else {
                                    if (reader_update) {
                                        const reader_updated = await Reader.updateItem(reader)
                                        logs_data.push({
                                            event: logUserEvents.CHANGE,
                                            target: `${Reader.name}/${acu_updated.old.name}/${access_point.name}/${readerTypes[reader_updated.old.type]}`,
                                            value: reader_updated
                                        })
                                    } else {
                                        logs_data.push({
                                            event: logUserEvents.CREATE,
                                            target: `${Reader.name}/${acu_updated.old.name}/${access_point.name}/${readerTypes[reader.type]}`,
                                            value: reader
                                        })
                                    }
                                }
                            }
                            if (readersSend) RdController.setRd(location, acu.serial_number, set_rd_data, user, acu.session_id)

                            // send CardKeys
                            // if (new_access_points.length) {
                            //     CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user, new_access_points)
                            // }
                            access_point_ind++
                        }

                        if (acu.status === acuStatus.ACTIVE) {
                            let checkAcuReaderSend: any = false
                            const old_acu_reader = await Reader.findOneOrFail({ id: acu_reader.id, company: company })
                            acu_reader.access_point = old_acu_reader.access_point
                            checkAcuReaderSend = checkSendingDevice(old_acu_reader, acu_reader, Reader.fields_that_used_in_sending, Reader.required_fields_for_sending)
                            const checkReaderOSDPDataSend = checkSendingDevice(old_acu_reader.osdp_data, acu_reader.osdp_data, Reader.OSDP_fields_that_used_in_sending)

                            if (checkAcuReaderSend) {
                                acuReaderSend = true
                                if (checkReaderOSDPDataSend) checkAcuReaderSend.osdp_data = checkReaderOSDPDataSend
                            } else {
                                if (checkReaderOSDPDataSend) {
                                    acuReaderSend = true
                                    checkAcuReaderSend = { id: acu_reader.id, osdp_data: checkReaderOSDPDataSend }
                                    for (const required_field of Reader.required_fields_for_sending) {
                                        if (required_field in acu_reader) checkAcuReaderSend[required_field] = acu_reader[required_field]
                                    }
                                }
                            }
                            if (checkAcuReaderSend) acu_reader = checkAcuReaderSend

                            if (acuReaderSend && acu.elevator_mode && req_data.access_points.length) {
                                const set_acu_rd_data = {
                                    ...acu_reader, update: true
                                }
                                RdController.setRdForFloor(location, acu.serial_number, set_acu_rd_data, req_data.access_points, user, acu.session_id)
                            }
                        } else {
                            if (acu_reader) {
                                const reader_updated = await Reader.updateItem(acu_reader)
                                logs_data.push({
                                    event: logUserEvents.CHANGE,
                                    target: `${Reader.name}/${acu_updated.old.name}/${readerTypes[reader_updated.old.type]}`,
                                    value: reader_updated
                                })
                            }
                        }
                    }
                }

                ctx.logsData = logs_data
                ctx.oldData = acu_updated.old
                const res_data = { ...acu_updated.new }
                if (acu_reader) res_data.readers = { ...acu_reader }
                ctx.body = res_data
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
                .leftJoinAndSelect('acu.readers', 'acu_reader', 'acu_reader.delete_date is null')
                .where(`acu.id = ${+ctx.params.id} `)
                .andWhere(`acu.company = ${ctx.user.company} `)
                .getOne()
            if (!data) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = data
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
            const location = `${user.company_main} /${user.company}`
            ctx.body = await Acu.destroyItem(where)
            logs_data.push({
                event: logUserEvents.DELETE,
                target: `${Acu.name}/${acu.name}`,
                value: { name: acu.name }
            })
            ctx.logsData = logs_data
            if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                DeviceController.delDevice(OperatorType.CANCEL_REGISTRATION, location, acu.serial_number, acu, user, acu.session_id)
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
 *                 - detach
 *                properties:
 *                  device:
 *                      type: number
 *                      example: 1
 *                  attached_hardware:
 *                      type: number
 *                      example: 2
 *                  detach:
 *                      type: boolean
 *                      example: true
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

            const detach = !!req_data.detach
            const device_status = (detach) ? acuStatus.ACTIVE : acuStatus.NO_HARDWARE
            // const device = await Acu.findOne({
            //     relations: [
            //         'ext_devices',
            //         'access_points',
            //         'access_points.readers',
            //         'access_points.access_rules',
            //         'access_points.access_rules.schedules',
            //         'access_points.access_rules.schedules.timeframes'
            //     ],
            //     where: {
            //         id: req_data.device,
            //         status: device_status,
            //         company: company
            //     }
            // })
            const device: any = await Acu.createQueryBuilder('acu')
                .leftJoinAndSelect('acu.ext_devices', 'ext_device', 'ext_device.delete_date is null')
                .leftJoinAndSelect('acu.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                .leftJoinAndSelect('access_point.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                .leftJoinAndSelect('access_point_zone.antipass_backs', 'antipass_back')
                .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`acu.id = '${req_data.device}'`)
                .andWhere(`acu.status = '${device_status}'`)
                .andWhere(`acu.company = '${company}'`)
                .getOne()

            if (!device) {
                ctx.status = 400
                return ctx.body = {
                    message: `Invalid ${device_status} device id!!`
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
                    message: 'Invalid hardware id!!'
                }
            }

            if (device.model !== hardware.model) {
                ctx.status = 400
                return ctx.body = {
                    message: 'device models are not same'
                }
            }
            const location = `${user.company_main}/${user.company}`

            const hardware_data = Object.assign({}, hardware)
            if (!detach) {
                device.status = acuStatus.ACTIVE
            } else {
                hardware.network = device.network
                hardware.interface = device.interface
                hardware.serial_number = device.serial_number
                hardware.session_id = device.session_id
                await hardware.save()
                DeviceController.delDevice(OperatorType.CANCEL_REGISTRATION, location, device.serial_number, device, user, device.session_id)
            }
            device.network = hardware_data.network
            device.interface = hardware_data.interface
            device.serial_number = hardware_data.serial_number
            device.session_id = hardware_data.session_id
            // device.time = hardware.time
            const updated = await device.save()
            await Acu.destroyItem(hardware)
            ctx.body = updated

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
                ExtensionDeviceController.setExtBrd(location, device.serial_number, ext_device, user, device.session_id)
            }

            // send Access Points
            const access_points = device.access_points
            const access_point_update = false
            for (const access_point of access_points) {
                const readers: any = access_point.readers
                CtpController.setCtp(access_point.type, location, device.serial_number, access_point, user, device.session_id, access_point_update)
                // send Readers

                const reader_update = false

                const set_rd_data: any = []
                for (const reader of readers) {
                    reader.access_point_type = access_point.type
                    set_rd_data.push({ ...reader, update: reader_update })
                    // RdController.setRd(location, device.serial_number, reader, user, device.session_id, reader_update)
                }
                RdController.setRd(location, device.serial_number, set_rd_data, user, device.session_id)

                // send Schedules(Access Rules)
                for (const access_rule of access_point.access_rules) {
                    SdlController.setSdl(location, device.serial_number, access_rule, user, device.session_id)
                }

                // send CardKeys

                CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user, null, null, [device])
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
                message: 'Invalid hardware id!!'
            }
        }
        hardware.status = acuStatus.ACTIVE
        await hardware.save()
        CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user, null, null, [hardware])
        return ctx.body = {
            message: 'success'
        }
    }

    /**
     *
     * @swagger
     *  /acu/deactivate:
     *      delete:
     *          tags:
     *              - Acu
     *          summary: deactivate an acu.
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
     *              description: Deactivating of Acu.
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
     *                  description: acu has been deactivated
     *              '422':
     *                  description: Wrong data
     */

    public static async deactivate (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const logs_data = []
            const acu: Acu = await Acu.findOneOrFail(where)
            const location = `${user.company_main}/${user.company}`
            if (acu.status !== acuStatus.ACTIVE) {
                ctx.status = 400
                ctx.body = {
                    message: `Can't Deactivate Acu with not having status ${acuStatus.ACTIVE}`
                }
            } else {
                ctx.body = await Acu.destroyItem(where)
                logs_data.push({
                    event: logUserEvents.DELETE,
                    target: `${Acu.name}/${acu.name}`,
                    value: { name: acu.name }
                })
                ctx.logsData = logs_data
                DeviceController.delDevice(OperatorType.CANCEL_REGISTRATION, location, acu.serial_number, acu, user, acu.session_id)
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
