import { DefaultContext } from 'koa'
import { AccessPoint } from '../model/entity/AccessPoint'
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
            if (!access_point) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await AccessPoint.destroyItem(where)
                if (access_point.acus.status === acuStatus.ACTIVE) {
                    if (access_point.type === accessPointType.DOOR) {
                        new SendDeviceMessage(OperatorType.DEL_CTP_DOOR, location, access_point.acus.serial_number, access_point.acus.session_id, req_data)
                        // SendDevice.delCtpDoor(location, access_point.acus.serial_number, access_point.acus.session_id, req_data)
                    } else if (access_point.type === accessPointType.TURNSTILE_ONE_SIDE || access_point.type === accessPointType.TURNSTILE_TWO_SIDE) {
                        new SendDeviceMessage(OperatorType.DEL_CTP_TURNSTILE, location, access_point.acus.serial_number, access_point, access_point.acus.session_id)
                    } else if (access_point.type === accessPointType.GATE) {
                        new SendDeviceMessage(OperatorType.DEL_CTP_GATE, location, access_point.acus.serial_number, access_point, access_point.acus.session_id)
                    } else if (access_point.type === accessPointType.GATEWAY) {
                        new SendDeviceMessage(OperatorType.DEL_CTP_GATEWAY, location, access_point.acus.serial_number, access_point, access_point.acus.session_id)
                    } else if (access_point.type === accessPointType.FLOOR) {
                        new SendDeviceMessage(OperatorType.DEL_CTP_FLOOR, location, access_point.acus.serial_number, access_point, access_point.acus.session_id)
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
            req_data.relations = ['acus', 'access_point_groups', 'access_point_zones']
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
            const company = user.company ? user.company : null
            req_data.company = company
            const location = `${user.company_main}/${user.company}`
            const where = { id: req_data.id, company: company }
            const reader: Reader = await Reader.findOneOrFail({ relations: ['access_points', 'access_points.acus'], where: where })
            req_data.direction = reader.direction
            req_data.port = reader.port
            req_data.access_point = reader.access_points.id
            req_data.access_point_type = reader.access_points.type
            ctx.body = await Reader.destroyItem(where)
            if (reader.access_points.acus.status === acuStatus.ACTIVE) {
                new SendDeviceMessage(OperatorType.DEL_RD, location, reader.access_points.acus.serial_number, req_data, reader.access_points.acus.session_id)
                ctx.body = true
            } else if (reader.access_points.acus.status === acuStatus.NO_HARDWARE) {
                // ctx.body = await Reader.destroyItem(where)
            } else {
                ctx.status = 400
                ctx.body = { message: 'You need to activate hardware' }
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

            if (!ap_resources.access_point_type[type]) {
                ctx.status = 400
                ctx.body = {
                    message: 'not correct access point type!'
                }
            } else {
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
