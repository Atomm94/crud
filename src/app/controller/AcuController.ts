import { DefaultContext } from 'koa'
import { Acu } from '../model/entity/Acu'
import { timeValidation, networkValidation, checkAccessPointsValidation } from '../functions/validator'
import { acuStatus } from '../enums/acuStatus.enum'
import { accessPointType } from '../enums/accessPointType.enum'
import SendDevice from '../mqtt/SendDevice'
import { AccessPoint } from '../model/entity/AccessPoint'
import { Reader } from '../model/entity/Reader'

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
     *                  serial_number:
     *                      type: string
     *                      example: ujexc device
     *                  description:
     *                      type: string
     *                      example: some description
     *                  model:
     *                      type: string
     *                      example: LRM-2CRS
     *                  status:
     *                      type: active | pending | no_hardware
     *                      example: pending
     *                  fw_version:
     *                      type: string
     *                      example: 1.3.4
     *                  maintain_update_manual:
     *                      type: boolean
     *                      example: true
     *                  shared_resource_mode:
     *                      type: boolean
     *                      example: false
     *                  connection_type:
     *                      type: wi-fi | ethernet
     *                      example: wi-fi
     *                  network:
     *                      type: object
     *                      properties:
     *                          ssid:
     *                              type: string
     *                              example: MYOF0987
     *                          password:
     *                              type: boolean
     *                              example: false
     *                          signal_level:
     *                              type: number
     *                              example: 55
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
     *                          port:
     *                              type: number
     *                              example: 2777
     *                  interface:
     *                      type: object
     *                      properties:
     *                          rs485_port_1:
     *                              type: object
     *                              properties:
     *                                  enable:
     *                                      type: boolean
     *                                      example: true
     *                                  mode:
     *                                      type: master | disable | slave
     *                                      example: master
     *                                  uart_mode:
     *                                      type: string
     *                                      example: 8n1
     *                                  baud_rate:
     *                                      type: 2400 | 4800 | 9600 | 14400 | 19200 | 28800 | 38400 | 56000
     *                                      example: 19200
     *                          rs485_port_2:
     *                              type: object
     *                              properties:
     *                                  enable:
     *                                      type: boolean
     *                                      example: false
     *                                  mode:
     *                                      type: master | disable | slave
     *                                      example: master
     *                                  uart_mode:
     *                                      type: string
     *                                      example: 8n1
     *                                  baud_rate:
     *                                      type: 2400 | 4800 | 9600 | 14400 | 19200 | 28800 | 38400 | 56000
     *                                      example: 19200
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

            const check_access_points = checkAccessPointsValidation(req_data.access_points, req_data.model)
            if (!check_access_points) {
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
                    const save_access_point: any = await AccessPoint.addItem(access_point)
                    for (const reader of access_point.readers) {
                        reader.access_point = save_access_point.id
                        await Reader.addItem(reader)
                    }
                }
            }

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
     *                  serial_number:
     *                      type: string
     *                      example: device
     *                  description:
     *                      type: string
     *                      example: some description
     *                  model:
     *                      type: string
     *                      example: LRM-2CRS
     *                  status:
     *                      type: active | pending | no_hardware
     *                      example: pending
     *                  ip_address:
     *                      type: number
     *                      example: 192.168.99.232
     *                  cloud_status:
     *                      type: boolean
     *                      example: true
     *                  fw_version:
     *                      type: string
     *                      example: 1.3.4
     *                  maintain_update_manual:
     *                      type: boolean
     *                      example: true
     *                  shared_resource_mode:
     *                      type: boolean
     *                      example: false
     *                  connection_type:
     *                      type: wi-fi | ethernet
     *                      example: ethernet
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
     *                          port:
     *                              type: number
     *                              example: 2777
     *                  interface:
     *                      type: object
     *                      properties:
     *                          rs485_port_1:
     *                              type: object
     *                              properties:
     *                                  enable:
     *                                      type: boolean
     *                                      example: true
     *                                  mode:
     *                                      type: master | disable | slave
     *                                      example: master
     *                                  uart_mode:
     *                                      type: string
     *                                      example: 8n1
     *                                  baud_rate:
     *                                      type: 2400 | 4800 | 9600 | 14400 | 19200 | 28800 | 38400 | 56000
     *                                      example: 19200
     *                          rs485_port_2:
     *                              type: object
     *                              properties:
     *                                  enable:
     *                                      type: boolean
     *                                      example: false
     *                                  mode:
     *                                      type: master | disable | slave
     *                                      example: master
     *                                  uart_mode:
     *                                      type: string
     *                                      example: 8n1
     *                                  baud_rate:
     *                                      type: 2400 | 4800 | 9600 | 14400 | 19200 | 28800 | 38400 | 56000
     *                                      example: 19200
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
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const acu = await Acu.findOne(where)
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
                            SendDevice.setNetSettings(`${user.company_main}/${user.company}`, acu.serial_number, acu.session_id ? acu.session_id : '0', req_data)
                            delete req_data.network
                        }
                    }
                }

                if (req_data.time && JSON.stringify(req_data.time) !== acu.time) {
                    const check_time = timeValidation(req_data.time)
                    if (!check_time) {
                        ctx.status = 400
                        return ctx.body = { message: check_time }
                    } else {
                        if (acu.status === acuStatus.ACTIVE || acu.status === acuStatus.PENDING) {
                            SendDevice.setDateTime(location, acu.serial_number, acu.session_id ? acu.session_id : '0', req_data)
                            delete req_data.time
                        }
                    }
                }

                const updated = await Acu.updateItem(req_data as Acu)

                if (req_data.access_points) {
                    const check_access_points = checkAccessPointsValidation(req_data.access_points, acu.model)
                    if (!check_access_points) {
                        ctx.status = 400
                        return ctx.body = { message: check_access_points }
                    } else {
                        for (let access_point of req_data.access_points) {
                            let access_point_update = true
                            if (!access_point.id) {
                                access_point_update = false
                                access_point.acu = acu.id
                                access_point = await AccessPoint.addItem(access_point)
                            }

                            if (acu.status === acuStatus.ACTIVE) {
                                if (access_point.type === accessPointType.DOOR) {
                                    SendDevice.setCtpDoor(location, acu.serial_number, acu.session_id ? acu.session_id : '0', access_point)
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
                                if (access_point_update) access_point = await AccessPoint.updateItem(access_point)
                            }

                            for (const reader of access_point.readers) {
                                let reader_update = true
                                if (!reader.id) {
                                    reader_update = false
                                    reader.access_point = access_point.id
                                    await Reader.addItem(reader)
                                }

                                if (acu.status === acuStatus.ACTIVE) {
                                    SendDevice.setRd(location, acu.serial_number, acu.session_id ? acu.session_id : '0', reader)
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
            const acu: any = await Acu.getItem(where)
            const location = `${user.company_main}/${user.company}`
            SendDevice.getStatusAcu(location, acu.serial_number, acu.session_id)
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
}
