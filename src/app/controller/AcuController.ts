import { DefaultContext } from 'koa'
import { Acu } from '../model/entity/Acu'
import * as acuModels from '../model/entity/acuModels.json'
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
     *                      example: ujexc device
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
            ctx.body = await Acu.addItem(req_data as Acu)
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
     *                      example: ujexc device
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
            const check_by_company = await Acu.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await Acu.updateItem(req_data as Acu)
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
            ctx.body = await Acu.getItem(where)
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
}
