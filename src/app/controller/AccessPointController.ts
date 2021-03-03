import { DefaultContext } from 'koa'
import { AccessPoint } from '../model/entity/AccessPoint'
import { Acu } from '../model/entity/Acu'
import { acuStatus } from '../enums/acuStatus.enum'
import { doorType } from '../enums/doorType.enum'

import SendDevice from '../mqtt/SendDevice'
export default class AccessPointController {
    /**
     *
     * @swagger
     *  /accessPoint:
     *      post:
     *          tags:
     *              - AccessPoint
     *          summary: Creates a accessPoint.
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
     *              name: accessPoint
     *              description: The accessPoint to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                      example: Door328
     *                  description:
     *                      type: string
     *                      example: some_description
     *                  type:
     *                      type: string
     *                      example: Door
     *                  status:
     *                      type: boolean
     *                      example: true
     *                  actual_passage:
     *                      type: boolean
     *                      example: true
     *                  mode:
     *                      type: N/A | credential | locked | unlocked | free_entry_block_exit | block_entry_free_exit
     *                      example: credential
     *                  apb_enable_local:
     *                      type: boolean
     *                      example: true
     *                  apb_enable_timer:
     *                      type: boolean
     *                      example: true
     *                  access_point_group:
     *                      type: number
     *                      example: 1
     *                  access_point_zone:
     *                      type: number
     *                      example: 1
     *                  acu:
     *                      type: number
     *                      example: 1
     *                  resources:
     *                      type: string
     *                      example: resources
     *          responses:
     *              '201':
     *                  description: A accessPoint object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const location = `${user.company_main}/${user.company}`
            req_data.company = user.company ? user.company : null
            const acu: any = await Acu.findOne({ id: req_data.acu })
            if (acu.status === acuStatus.ACTIVE) {
                if (req_data.type === doorType.DOOR) {
                    const access_point: any = await AccessPoint.addItem(req_data as AccessPoint)
                    SendDevice.setCtpDoor(location, acu.serial_number, acu.session_id, access_point)
                }
                //  else if (req_data.type === doorType.TURNSTILE) {
                //     SendDevice.SetCtpTurnstile(location, acu.serial_number, acu.session_id, req_data)
                // } else if (req_data.type === doorType.GATE) {
                //     SendDevice.SetCtpGate(location, acu.serial_number, acu.session_id, req_data, schedule)
                // } else if (req_data.type === doorType.GATEWAY) {
                //     SendDevice.SetCtpGateWay(location, acu.serial_number, acu.session_id, req_data)
                // } else if (req_data.type === doorType.FLOOR) {
                //     SendDevice.SetCtpFloor(location, acu.serial_number, acu.session_id, req_data)
                // }
            }

            ctx.body = await AccessPoint.addItem(req_data as AccessPoint)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessPoint:
     *      put:
     *          tags:
     *              - AccessPoint
     *          summary: Update a accessPoint.
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
     *              name: accessPoint
     *              description: The accessPoint to create.
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
     *                      example: Door328
     *                  description:
     *                      type: string
     *                      example: some_description
     *                  type:
     *                      type: string
     *                      example: Door
     *                  status:
     *                      type: boolean
     *                      example: true
     *                  actual_passage:
     *                      type: boolean
     *                      example: true
     *                  mode:
     *                      type: N/A | credential | locked | unlocked | free_entry_block_exit | block_entry_free_exit
     *                      example: credential
     *                  apb_enable_local:
     *                      type: boolean
     *                      example: true
     *                  apb_enable_timer:
     *                      type: boolean
     *                      example: true
     *                  access_point_group:
     *                      type: number
     *                      example: 1
     *                  access_point_zone:
     *                      type: number
     *                      example: 1
     *                  resources:
     *                      type: string
     *                      example: resources
     *          responses:
     *              '201':
     *                  description: A accessPoint updated object
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
            const check_by_company = await AccessPoint.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await AccessPoint.updateItem(req_data as AccessPoint)
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
     * /accessPoint/{id}:
     *      get:
     *          tags:
     *              - AccessPoint
     *          summary: Return accessPoint by ID
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
            ctx.body = await AccessPoint.getItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accessPoint:
     *      delete:
     *          tags:
     *              - AccessPoint
     *          summary: Delete a accessPoint.
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
     *              name: accessPoint
     *              description: The accessPoint to create.
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
     *                  description: accessPoint has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const access_point = await AccessPoint.findOne({ relations: ['acus'], where: where })
            const location = `${user.company_main}/${user.company}`
            console.log(access_point)
            if (!access_point) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await AccessPoint.destroyItem(req_data as { id: number })
                if (access_point.acus.status === acuStatus.ACTIVE) {
                    if (access_point.type === doorType.DOOR) {
                        SendDevice.delCtpDoor(location, access_point.acus.serial_number, access_point.acus.session_id, req_data)
                    }
                }
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
     * /accessPoint:
     *      get:
     *          tags:
     *              - AccessPoint
     *          summary: Return accessPoint list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accessPoint
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await AccessPoint.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
