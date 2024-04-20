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
import { acuMainTain } from '../enums/acuMainTain.enum'
import { checkSendingDevice } from '../functions/check-sending-device'
import { AccessPointZone } from '../model/entity'
import { locationGenerator } from '../functions/locationGenerator'
import { CheckAccessPoint } from '../functions/check-accessPoint'
import { AcuStatus } from '../model/entity/AcuStatus'
import { acuCloudStatus } from '../enums/acuCloudStatus.enum'
import { cloneDeep } from 'lodash'
import { CameraSet } from '../model/entity/CameraSet'
// import acu from '../router/acu'

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
     *                                  type: string
     *                                  enum: [N/A, credential, locked, unlocked, free_entry_block_exit, block_entry_free_exit]
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
                const check_access_points = checkAccessPointsValidation(req_data.access_points, req_data.model, req_data.elevator_mode, acu_reader, false)
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
                const check_resources_limit = await CheckAccessPoint.checkResourcesLimit(req_data.access_points, req_data.company)
                if (check_resources_limit !== true) {
                    ctx.status = 403
                    return ctx.body = { message: check_resources_limit }
                }

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
     *                          time_zone_unix:
     *                              type: string
     *                              example: 05:45
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
     *                                  type: string
     *                                  enum: [N/A, credential, locked, unlocked, free_entry_block_exit, block_entry_free_exit]
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
            const acu: Acu | null = await Acu.findOne({ where })
            const location = await locationGenerator(user)

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
                    const checkDateTimeSend = checkSendingDevice(acu.time, req_data.time, null, Acu.time_fields_that_used_in_sending)
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
                    const check_access_points = checkAccessPointsValidation(req_data.access_points, acu.model, req_data.elevator_mode, acu_reader, true)
                    if (check_access_points !== true) {
                        ctx.status = 400
                        return ctx.body = { message: check_access_points }
                    }

                    if (acu.status === acuStatus.PENDING && req_data.access_points && req_data.access_points.length) {
                        ctx.status = 400
                        return ctx.body = { message: `You cant add accessPoints when acu status is ${acuStatus.PENDING}` }
                    }

                    const check_resources_limit = await CheckAccessPoint.checkResourcesLimit(req_data.access_points, company)
                    if (check_resources_limit !== true) {
                        ctx.status = 403
                        return ctx.body = { message: check_resources_limit }
                    }

                    // const new_access_points: AccessPoint[] = [] // for sending Set(Add)CardKey
                    let access_point_ind = 0
                    for (let access_point of req_data.access_points) {
                        for (const resource in access_point.resources) {
                            const component_source: number = access_point.resources[resource].component_source
                            if (component_source !== 0) { // when component source is 0, so it is device
                                const ext_device = await ExtDevice.findOne({ where: { id: component_source, company: company } })
                                if (!ext_device) {
                                    ctx.status = 400
                                    return ctx.body = { message: `Invalid Component Source ${component_source}!` }
                                }
                            }
                        }

                        let access_point_update = true
                        const readers = access_point.readers

                        let checkAccessPointSend: any = false
                        access_point.company = company
                        if (!access_point.id) {
                            if (acu.elevator_mode) acuReaderSend = true
                            access_point_update = false
                            access_point.acu = acu.id
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
                            const old_access_point = await AccessPoint.findOneOrFail({ where: { id: access_point.id, company: company } })
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
                                const oldResources = JSON.parse(access_point_update.old.resources)
                                const newResources = JSON.parse(access_point_update.new.resources)
                                if (Object.keys(oldResources).length > Object.keys(newResources).length) {
                                    const resourceNames = Object.keys(oldResources).filter(elem => newResources[elem] === undefined)
                                    logs_data.push({
                                        event: logUserEvents.DELETE,
                                        target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point_update.old.name}`,
                                        value: { name: resourceNames.length === 1 ? resourceNames[0] : resourceNames }
                                    })
                                } else {
                                    logs_data.push({
                                        event: logUserEvents.CHANGE,
                                        target: `${AccessPoint.name}/${acu_updated.old.name}/${access_point_update.old.name}`,
                                        value: access_point_update
                                    })
                                }
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
                                const old_reader = await Reader.findOneOrFail({ where: { id: reader.id, company: company } })
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
                        if (readersSend) {
                            let access_point_zone: any = null
                            if (access_point_update) {
                                if (checkAccessPointSend && checkAccessPointSend.access_point_zones) {
                                    access_point_zone = checkAccessPointSend.access_point_zones
                                } else if (access_point.access_point_zones) {
                                    access_point_zone = access_point.access_point_zones
                                } else if (access_point.access_point_zone) {
                                    access_point_zone = await AccessPointZone.findOne({ where: { id: access_point.access_point_zone }, relations: ['antipass_backs'] })
                                }
                            } else {
                                access_point_zone = access_point.access_point_zones
                            }
                            RdController.setRd(location, acu.serial_number, set_rd_data, access_point_zone, user, acu.session_id)
                        }

                        // send CardKeys
                        // if (new_access_points.length) {
                        //     CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, user, new_access_points)
                        // }
                        access_point_ind++
                    }
                }

                if (req_data.elevator_mode && acu_reader && acu.status === acuStatus.ACTIVE) {
                    let checkAcuReaderSend: any = false
                    if (!acu_reader.id) {
                        acuReaderSend = true
                        acu_reader.company = company
                        acu_reader = await Reader.addItem(acu_reader)
                        await Acu.updateItem({ id: acu.id, reader: acu_reader.id } as Acu)
                        acu_updated.new.reader = acu_reader.id
                    } else {
                        const old_acu_reader = await Reader.findOneOrFail({ where: { id: acu_reader.id, company: company } })
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
                    }

                    if (checkAcuReaderSend) acu_reader = checkAcuReaderSend

                    if (acuReaderSend && acu.elevator_mode && req_data.access_points) {
                        const set_acu_rd_data = {
                            ...acu_reader,
                            update: true
                        }
                        RdController.setRdForFloor(location, acu.serial_number, set_acu_rd_data, req_data.access_points, user, acu.session_id)
                    }
                } else {
                    if (req_data.elevator_mode && acu_reader) {
                        if (!acu_reader.id) {
                            acu_reader.company = company
                            acu_reader = await Reader.addItem(acu_reader)
                            await Acu.updateItem({ id: acu.id, reader: acu_reader.id } as Acu)
                            acu_updated.new.reader = acu_reader.id
                        } else {
                            acu_reader = (await Reader.updateItem(acu_reader)).new
                            logs_data.push({
                                event: logUserEvents.CHANGE,
                                target: `${Reader.name}/${acu_updated.old.name}/${readerTypes[acu_reader.type]}`,
                                value: acu_reader
                            })
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
            const acu: Acu = await Acu.findOneOrFail({ where })
            ctx.body = await Acu.destroyItem(where)
            const logs_data = []
            logs_data.push({
                event: logUserEvents.DELETE,
                target: `${Acu.name}/${acu.name}`,
                value: { name: acu.name }
            })
            ctx.logsData = logs_data
            if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                // ctx.body = { message: 'Delete pending' }
                const location = `${user.company_main}/${user.company}`
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
     *              - in: query
     *                name: status
     *                description: status of Acu
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

            const take = req_data.page_items_count ? (req_data.page_items_count > 10000) ? 10000 : req_data.page_items_count : 25
            const skip = req_data.page_items_count && req_data.page ? (req_data.page - 1) * req_data.page_items_count : 0

            let data: any = Acu.createQueryBuilder('acu')
                .select(
                    [
                        'acu.id',
                        'acu.name',
                        'acu.serial_number',
                        'acu.description',
                        'acu.model',
                        'acu.status',
                        'acu.cloud_status',
                        'acu.maintain_update_manual',
                        'acu.network',
                        'acu.registration_date',
                        'acu.fw_version',
                        'acu.api_ver',
                        'acu.acu_comment',
                        'acu.rev'
                    ]
                )
                .addSelect(['acu_status.timestamp'])
                // .leftJoin('acu.access_points', 'access_point')
                .leftJoin('acu.acu_statuses', 'acu_status')
                // .leftJoin('access_point.readers', 'reader')
                .take(take)
                .skip(skip)
                .cache(`acu:acu_statuses:${ctx.user.company}-${take}-${skip}`, 168 * 60 * 60 * 1000)
                .where(`acu.company = ${ctx.user.company}`)
                .andWhere('not (acu.status = :status and acu.cloud_status = :cloud_status)', {
                    status: acuStatus.PENDING,
                    cloud_status: acuCloudStatus.OFFLINE
                })
            if (req_data.status) {
                data = data.andWhere(`acu.status = '${req_data.status}'`)
            }
            data.orderBy('acu.id', 'DESC')

            data = await data.getMany()
            if (req_data.page) {
                let total: any = await Acu.createQueryBuilder('acu')
                    .select('COUNT(id) ', 'count')
                    .where(`acu.company = '${user.company ? user.company : null}'`)
                    .andWhere('not (acu.status = :status and acu.cloud_status = :cloud_status)', {
                        status: acuStatus.PENDING,
                        cloud_status: acuCloudStatus.OFFLINE
                    })
                if (req_data.status) {
                    total = total.andWhere(`acu.status = '${req_data.status}'`)
                }
                total.cache(`acu:count:${ctx.user.company}`, 168 * 60 * 60 * 1000)
                total = await total.getRawOne()
                ctx.body = {
                    data: data,
                    count: total.count
                }
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
                status: { '=': acuStatus.PENDING },
                cloud_status: { '=': acuCloudStatus.ONLINE }
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
                where: {
                    id: req_data.attached_hardware,
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

            if (device.model !== hardware.model) {
                ctx.status = 400
                return ctx.body = {
                    message: 'device models are not same'
                }
            }
            const location = await locationGenerator(user)

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
            device.fw_version = hardware_data.fw_version
            device.rev = hardware_data.rev
            device.api_ver = hardware_data.api_ver
            device.acu_comment = hardware_data.acu_comment
            device.registration_date = hardware_data.registration_date
            device.cloud_status = hardware_data.cloud_status

            // device.time = hardware.time
            const updated = await device.save()
            const acu_status = await AcuStatus.findOne({ where: { acu: device.id } })
            if (acu_status) {
                acu_status.serial_number = device.serial_number
                await acu_status.save()
            }

            await Acu.destroyItem(hardware)
            ctx.body = updated

            if (detach) {
                for (const access_point of device.access_points) {
                    const camera_set = await CameraSet.findOne({ where: { access_point: access_point.id } })
                    if (camera_set) CameraSet.destroyItem(camera_set)
                }
                return ctx.body
            }

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
                RdController.setRd(location, device.serial_number, set_rd_data, access_point.access_point_zones, user, device.session_id)

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
        const location = await locationGenerator(user)

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
            const acu: Acu = await Acu.findOneOrFail({ where })
            const location = await locationGenerator(user)
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

    /**
 *
 * @swagger
 *  /acu/maintain:
 *      post:
 *          tags:
 *              - Acu
 *          summary: Maintain Settings.
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
 *                 - acu
 *                 - name
 *                properties:
 *                  acu:
 *                      type: number
 *                      example: 1
 *                  name:
 *                      type: string
 *                      enum: [restart, deactivate, reset, reset_to_factory]
 *                      example: restart
 *          responses:
 *              '201':
 *                  description: A acu object
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */

    public static async maintain (ctx: DefaultContext) {
        const req_data = ctx.request.body
        const user = ctx.user
        const location = await locationGenerator(user)
        const acu = await Acu.findOne({ where: { id: req_data.acu } })
        if (!acu) {
            ctx.status = 400
            return ctx.body = {
                message: 'Invalid id'
            }
        }
        if (acu.status !== acuStatus.ACTIVE) {
            ctx.status = 400
            return ctx.body = {
                message: 'Invalid status of Acu'
            }
        }
        if (!Object.values(acuMainTain).includes(req_data.name)) {
            ctx.status = 400
            return ctx.body = {
                message: 'Invalid name of mainTain'
            }
        }

        DeviceController.maintain(location, acu.serial_number, { main_tain: req_data.name }, user)
        return ctx.body = {
            message: 'Reset Pending'
        }
    }

    /**
 *
 * @swagger
 *  /acu/copy:
 *      post:
 *          tags:
 *              - Acu
 *          summary: Maintain Settings.
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
 *                 - acu_copy
 *                 - acu_paste
 *                properties:
 *                  acu_copy:
 *                      type: number
 *                      example: 1
 *                  acu_paste:
 *                      type: string
 *                      example: 1
 *          responses:
 *              '201':
 *                  description: A acu object
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */

    public static async copy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const location = await locationGenerator(user)
            const acu_copy: any = await Acu.createQueryBuilder('acu')
                .leftJoinAndSelect('acu.ext_devices', 'ext_device', 'ext_device.delete_date is null')
                .leftJoinAndSelect('acu.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                .leftJoinAndSelect('access_point_zone.antipass_backs', 'antipass_back')
                .where(`acu.id = '${req_data.acu_copy}'`)
                .andWhere(`acu.company = '${user.company}'`)
                .getOne()

            const acu_paste: any = await Acu.createQueryBuilder('acu')
                .leftJoinAndSelect('acu.ext_devices', 'ext_device', 'ext_device.delete_date is null')
                .leftJoinAndSelect('acu.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                .where(`acu.id = '${req_data.acu_paste}'`)
                .andWhere(`acu.company = '${user.company}'`)
                .getOne()

            // const acu_paste = await Acu.findOne({ where: { id: req_data.acu_paste } })
            if (!acu_copy || !acu_paste) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid id'
                }
            }
            if (acu_paste.status !== acuStatus.ACTIVE || acu_copy.status !== acuStatus.ACTIVE) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid status of Acu'
                }
            }
            if (acu_copy.model !== acu_paste.model) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Acu\'s models must be same'
                }
            }
            if (acu_paste.ext_devices.length || acu_paste.access_points.length) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Acu\'s paste must be empty'
                }
            }

            if (acu_paste.cloud_status !== acuCloudStatus.ONLINE) {
                ctx.status = 400
                return ctx.body = {
                    message: 'The operation could not be completed because the device is not online'
                }
            }
            const ext_device_compare: any = {}
            for (const acu_copy_ext_device of acu_copy.ext_devices) {
                let acu_paste_ext_device = cloneDeep(acu_copy_ext_device)
                acu_paste_ext_device.acu = acu_paste.id
                acu_paste_ext_device = await ExtDevice.addItem(acu_paste_ext_device)
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
                acu_paste_ext_device.resources = {
                    input: inputs,
                    output: outputs

                }
                ExtensionDeviceController.setExtBrd(location, acu_paste.serial_number, acu_paste_ext_device, user, acu_paste.session_id)

                ext_device_compare[acu_copy_ext_device.id] = acu_paste_ext_device.id
            }
            for (const acu_copy_access_point of acu_copy.access_points) {
                let acu_paste_access_point = cloneDeep(acu_copy_access_point)
                acu_paste_access_point.acu = acu_paste.id
                if (acu_copy_access_point.resources) {
                    const acu_copy_access_point_resources = JSON.parse(acu_copy_access_point.resources)
                    for (const resource_key in acu_copy_access_point_resources) {
                        if (acu_copy_access_point_resources[resource_key].component_source) {
                            acu_copy_access_point_resources[resource_key] = {
                                ...acu_copy_access_point_resources[resource_key],
                                component_source: ext_device_compare[acu_copy_access_point_resources[resource_key].component_source]
                            }
                        }
                    }
                    // acu_copy_access_point_resources = acu_copy_access_point_resources.map((resource: any) => {
                    //     return {
                    //         ...resource,
                    //         component_source: ext_device_compare[resource.component_source]
                    //     }
                    // })
                    acu_paste_access_point.resources = JSON.stringify(acu_copy_access_point_resources)
                }
                acu_paste_access_point = await AccessPoint.addItem(acu_paste_access_point)
                CtpController.setCtp(acu_paste_access_point.type, location, acu_paste.serial_number, acu_paste_access_point, user, acu_paste.session_id)
                const set_rd_data: any = []
                for (const acu_copy_reader of acu_copy_access_point.readers) {
                    let acu_paste_reader = cloneDeep(acu_copy_reader)
                    acu_paste_reader.access_point = acu_paste_access_point.id
                    acu_paste_reader = await Reader.addItem(acu_paste_reader)
                    acu_paste_reader.access_point_type = acu_copy_access_point.type
                    set_rd_data.push(acu_paste_reader)
                }
                RdController.setRd(location, acu_paste.serial_number, set_rd_data, acu_copy_access_point.access_point_zones, user, acu_paste.session_id)
            }

            CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, user.company, user, null, null, [acu_paste])

            // DeviceController.copy(location, acu_paste.serial_number, { main_tain: req_data.name }, user)
            ctx.body = {
                message: 'success'
            }
        } catch (error) {
            console.log('error', error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
