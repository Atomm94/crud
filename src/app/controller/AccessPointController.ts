import { DefaultContext } from 'koa'
import { AccessPoint } from '../model/entity/AccessPoint'
import { acuStatus } from '../enums/acuStatus.enum'
import { accessPointType } from '../enums/accessPointType.enum'

// import SendDevice from '../mqtt/SendDevice'
import { Reader } from '../model/entity/Reader'
// import { Reader } from '../model/entity/Reader'
import accessPointResources from '../model/entity/accessPointResources.json'
import CtpController from './Hardware/CtpController'
import RdController from './Hardware/RdController'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { readerTypes } from '../enums/readerTypes'
import { accessPointMode } from '../enums/accessPointMode.enum'
import { accessPointDirection } from '../enums/accessPointDirection.enum'

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

            const logs_data = []
            if (!access_point) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await AccessPoint.destroyItem(where)
                if (access_point.acus.status === acuStatus.ACTIVE) {
                    CtpController.delCtp(access_point.type, location, access_point.acus.serial_number, req_data, user, access_point.acus.session_id)
                }
                logs_data.push({
                    event: logUserEvents.DELETE,
                    target: `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`,
                    value: { name: access_point.name }
                })
                ctx.logsData = logs_data
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
            // const req_data = ctx.query
            const user = ctx.user
            // req_data.where = { company: { '=': user.company ? user.company : null } }
            // req_data.relations = ['acus', 'access_point_groups', 'access_point_zones']
            // ctx.body = await AccessPoint.getAllItems(req_data)

            const access_points: any = await AccessPoint.createQueryBuilder('access_point')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .leftJoinAndSelect('access_point.access_point_groups', 'access_point_group', 'access_point_group.delete_date is null')
                .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                .andWhere(`access_point.company = '${user.company ? user.company : null}'`)
                .getMany()

            ctx.body = access_points
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
            const logs_data = []
            const req_data: any = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null
            req_data.company = company
            const location = `${user.company_main}/${user.company}`
            const where = { id: req_data.id, company: company }
            // const reader: any = await Reader.findOneOrFail({ relations: ['access_points', 'access_points.acus'], where: where })

            const reader: any = await Reader.createQueryBuilder('reader')
                .leftJoinAndSelect('reader.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acus', 'acus.delete_date is null')
                .where(`reader.id = '${req_data.id}'`)
                .andWhere(`reader.company = '${user.company ? user.company : null}'`)
                .getOne()

            req_data.direction = reader.direction
            req_data.port = reader.port
            req_data.access_point = reader.access_points.id
            req_data.access_point_type = reader.access_points.type

            logs_data.push({
                event: logUserEvents.DELETE,
                target: `${Reader.name}/${reader.access_points.acus.name}/${reader.access_points.name}/${readerTypes[reader.type]}`,
                value: { type: readerTypes[reader.type] }
            })
            ctx.logsData = logs_data
            if (reader.access_points.acus.status === acuStatus.ACTIVE) {
                RdController.delRd(location, reader.access_points.acus.serial_number, req_data, user, reader.access_points.acus.session_id)
                ctx.body = { message: 'Delete pending' }
            } else if (reader.access_points.acus.status === acuStatus.NO_HARDWARE) {
                ctx.body = await Reader.destroyItem(where)
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

    /**
     *
     * @swagger
     *  /accessPoint/updateMode:
     *      put:
     *          tags:
     *              - AccessPoint
     *          summary: Update AccessPoint Mode.
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
     *              description: Change of accessPoint mode.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                  - mode
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  mode:
     *                      type: string
     *                      enum: [open_once, N/A, credential, locked, unlocked, free_entry_block_exit, block_entry_free_exit]
     *                      example: credential
     *                  exit_mode:
     *                      type: string
     *                      enum: [N/A, credential, locked, unlocked, free_entry_block_exit, block_entry_free_exit]
     *                      example: credential
     *                  direction:
     *                      type: string
     *                      enum: [entry, exit]
     *                      example: entry
     *          responses:
     *              '201':
     *                  description: AccessPoint mode update
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateMode (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null
            const where = { id: req_data.id, company: company }
            const access_point: any = await AccessPoint.findOneOrFail({ where: where, relations: ['acus'] })
            const location = `${user.company_main}/${user.company}`

            if (access_point.acus.status !== acuStatus.ACTIVE) {
                ctx.status = 400
                ctx.body = {
                    message: `Cant update AccessPoint Mode when Acu status is not ${acuStatus.ACTIVE}`
                }
            } else {
                if ((Object.values(accessPointMode).indexOf(req_data.mode) === -1) && Object.values(accessPointMode).indexOf(req_data.exit_mode) === -1) {
                    if (req_data.mode !== 'open_once') {
                        ctx.status = 400
                        ctx.body = {
                            message: `Invalid AccessPoint Mode ${req_data.mode} or Exit Mode`
                        }
                    } else {
                        if ('direction' in req_data) {
                            if (Object.values(accessPointDirection).indexOf(req_data.direction) === -1) {
                                ctx.body = {
                                    message: `Invalid AccessPoint Direction ${req_data.direction}`
                                }
                            } else {
                                const single_pass_data: any = {
                                    id: access_point.id,
                                    direction: req_data.direction
                                }
                                CtpController.singlePass(location, access_point.acus.serial_number, single_pass_data, user, access_point.acus.session_id)
                                ctx.body = {
                                    message: 'Open Once sended'
                                }
                            }
                        } else {
                            ctx.status = 400
                            ctx.body = {
                                message: `direction is required when AccessPoint Mode is ${req_data.mode}`
                            }
                        }
                    }
                } else {
                    const set_access_mode_data: any = {
                        id: access_point.id,
                        type: access_point.type
                    }
                    if (req_data.mode) set_access_mode_data.mode = req_data.mode
                    if (req_data.exit_mode) set_access_mode_data.exit_mode = req_data.exit_mode
                    CtpController.setAccessMode(location, access_point.acus.serial_number, set_access_mode_data, user, access_point.acus.session_id)
                    ctx.body = {
                        message: 'update Pending'
                    }
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
    }
}
