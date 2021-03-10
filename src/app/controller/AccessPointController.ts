import { DefaultContext } from 'koa'
import { AccessPoint } from '../model/entity/AccessPoint'
import { Acu } from '../model/entity/Acu'
import { acuStatus } from '../enums/acuStatus.enum'
import { accessPointType } from '../enums/accessPointType.enum'

// import SendDevice from '../mqtt/SendDevice'
import SendDeviceMessage from '../mqtt/SendDeviceMessage'
import { OperatorType } from '../mqtt/Operators'
import { Reader } from '../model/entity/Reader'
// import { Reader } from '../model/entity/Reader'
import accessPointResources from '../model/entity/accessPointResources.json'

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
            const acu: Acu = await Acu.getItem({ id: req_data.acu })
            if (acu.status === acuStatus.ACTIVE) {
                if (req_data.type === accessPointType.DOOR) {
                    const access_point: any = await AccessPoint.addItem(req_data as AccessPoint)
                    new SendDeviceMessage(OperatorType.SET_CTP_DOOR, location, acu.serial_number, acu.session_id, access_point)
                    // SendDevice.setCtpDoor(location, acu.serial_number, acu.session_id, access_point)
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
                    if (access_point.type === accessPointType.DOOR) {
                        new SendDeviceMessage(OperatorType.DEL_CTP_DOOR, location, access_point.acus.serial_number, access_point.acus.session_id, req_data)
                        // SendDevice.delCtpDoor(location, access_point.acus.serial_number, access_point.acus.session_id, req_data)
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

    /**
     *
     * @swagger
     *  /accessPoint/reader:
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
    public static async readerDestroy (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user
            const location = `${user.company_main}/${user.company}`
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const reader: any = await Reader.findOne({ relations: ['access_points', 'access_points.acus'], where: where })
            req_data.direction = reader.direction
            req_data.port = reader.port
            req_data.access_point = reader.access_points.id
            req_data.access_point_type = reader.access_points.type
            if (reader.acus.status === acuStatus.ACTIVE) {
                new SendDeviceMessage(OperatorType.DEL_EXT_BRD, location, reader.acus.serial_number, req_data, reader.acus.session_id)
            } else if (reader.acus.status === acuStatus.NO_HARDWARE) {
                ctx.body = await Reader.destroyItem(ctx.request.body as { id: number })
            } else {
                ctx.status = 400
                ctx.body = { message: 'You need to activate hardware' }
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
    * /accessPoint/types:
    *      get:
    *          tags:
    *              - AccessPoint
    *          summary: Return accessPointResources
    *          parameters:
    *              - in: header
    *                name: Authorization
    *                required: true
    *                description: Authentication token
    *                schema:
    *                    type: string
    *          responses:
    *              '200':
    *                  description: accessPointResources
    *              '401':
    *                  description: Unauthorized
    */
    public static async getAccessPointTypes (ctx: DefaultContext) {
        try {
            ctx.body = Object.values(accessPointType)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /accessPoint/resources/{type}:
     *      get:
     *          tags:
     *              - AccessPoint
     *          summary: Return accessPointResources
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - name: type
     *                in: path
     *                required: true
     *                description: AccessPoint type
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: accessPointResources
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAccessPointResources (ctx: DefaultContext) {
        try {
            const type = ctx.params.type
            const ap_resources: any = accessPointResources
            console.log(ap_resources.access_point_type[type])

            if (!ap_resources.access_point_type[type]) {
                ctx.status = 400
                ctx.body = {
                    message: 'not correct access point type!'
                }
            } else {
                console.log(ap_resources.access_point_type[type])
                const resource_data = ap_resources.access_point_type[type]
                Object.keys(resource_data.resources).forEach(rio => { // rio - reader input output
                    Object.keys(resource_data.resources[rio]).forEach(rio_key => {
                        if (typeof resource_data.resources[rio][rio_key] === 'string') {
                            const default_configs_key = resource_data.resources[rio][rio_key]
                            resource_data.resources[rio][rio_key] = ap_resources.default_configs[default_configs_key]
                        }
                    })
                })
                ctx.body = resource_data
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
