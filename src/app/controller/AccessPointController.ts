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
import { locationGenerator } from '../functions/locationGenerator'
import { AccessRule, Cardholder } from '../model/entity'

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
            let company = user.company ? user.company : null
            if (user.companyData.partition_parent_id) {
                company = user.companyData.partition_parent_id
            }
            const where: any = { id: +ctx.params.id, company: company }
            const relations = ['access_point_zones']
            ctx.body = await AccessPoint.getItem(where, relations)
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
            const location = await locationGenerator(user)

            const logs_data = []
            if (!access_point) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                if (access_point.acus.status === acuStatus.ACTIVE) {
                    CtpController.delCtp(access_point.type, location, access_point.acus.serial_number, req_data, user, access_point.acus.session_id)
                    ctx.body = {
                        message: 'delete pending'
                    }
                } else {
                    ctx.body = await AccessPoint.destroyItem(where)
                    logs_data.push({
                        event: logUserEvents.DELETE,
                        target: `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`,
                        value: { name: access_point.name }
                    })
                    ctx.logsData = logs_data
                }
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
     *              - in: query
     *                name: status
     *                description: status of Acu
     *                schema:
     *                    type: string
     *                    enum: [active, pending, no_hardware]
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
            let access_points: any
            let resurce_limited
            let take_limit
            if (ctx.query.packageExtraSettings) {
                if (ctx.query.packageExtraSettings.resources.Cardholder) {
                    take_limit = ctx.query.packageExtraSettings.resources.Cardholder
                } else {
                    take_limit = 0
                }
                resurce_limited = true
            }
            if (!user.companyData.partition_parent_id) {
                access_points = AccessPoint.createQueryBuilder('access_point')
                    .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                    .leftJoinAndSelect('access_point.access_point_groups', 'access_point_group', 'access_point_group.delete_date is null')
                    .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                    .leftJoinAndSelect('reader.leaving_zones', 'leaving_zone', 'leaving_zone.delete_date is null')
                    .leftJoinAndSelect('reader.came_to_zones', 'came_to_zone', 'came_to_zone.delete_date is null')
                    .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                    .andWhere(`access_point.company = '${user.company ? user.company : null}'`)
            } else {
                const base_access_points: any = JSON.parse(user.companyData.base_access_points)
                access_points = AccessPoint.createQueryBuilder('access_point')
                    .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                    .leftJoinAndSelect('access_point.access_point_groups', 'access_point_group', 'access_point_group.delete_date is null')
                    .leftJoinAndSelect('access_point.readers', 'reader', 'reader.delete_date is null')
                    .leftJoinAndSelect('reader.leaving_zones', 'leaving_zone', 'leaving_zone.delete_date is null')
                    .leftJoinAndSelect('reader.came_to_zones', 'came_to_zone', 'came_to_zone.delete_date is null')
                    .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                    .andWhere(`access_point.company = '${user.companyData.partition_parent_id}'`)
                    .andWhere(`access_point.id in(${base_access_points}) `)
            }
            if (ctx.query.status) {
                access_points = access_points.andWhere(`acu.status = '${ctx.query.status}'`)
            }

            if (!resurce_limited) {
                access_points = await access_points
                    .getMany()
            } else {
                access_points = await access_points
                    .orderBy('access_point.id', 'DESC')
                    .take(take_limit)
                    .getMany()
            }

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
            const location = await locationGenerator(user)
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

            if (reader.access_points.acus.status === acuStatus.ACTIVE) {
                RdController.delRd(location, reader.access_points.acus.serial_number, req_data, user, reader.access_points.acus.session_id)
                ctx.body = { message: 'Delete pending' }
            } else if (reader.access_points.acus.status === acuStatus.NO_HARDWARE) {
                ctx.body = await Reader.destroyItem(where)
                logs_data.push({
                    event: logUserEvents.DELETE,
                    target: `${Reader.name}/${reader.access_points.acus.name}/${reader.access_points.name}/${readerTypes[reader.type]}`,
                    value: { type: readerTypes[reader.type] }
                })
                ctx.logsData = logs_data
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
     *                  - mode
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  ids:
     *                      type: Array<number>
     *                      example: [1, 2]
     *                  mode:
     *                      type: string
     *                      enum: [open_once, N/A, credential, locked, unlocked, free_entry_block_exit, block_entry_free_exit, antipanic]
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
            // const where: { [key: string]: any } = { company: company }
            // if (req_data.id) {
            // where.id = req_data.id
            // }

            const access_points_query = AccessPoint.createQueryBuilder('access_point')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`access_point.company = '${company}'`)

            if (req_data.id) {
                access_points_query.andWhere(`acu.status = '${acuStatus.ACTIVE}'`)
            } else if (req_data.ids?.length) {
                access_points_query.andWhere(`access_point.id in (${req_data.ids})`)
            }

            const access_points = await access_points_query.getMany()

            if (!access_points.length) {
                ctx.status = 400
                return ctx.body = {
                    message: 'There is no active Access Points'
                }
            }
            // const access_point: any = await AccessPoint.findOneOrFail({ where: where, relations: ['acus'] })
            const location = await locationGenerator(user)

            for (const access_point of access_points) {
                if (access_point.acus.status !== acuStatus.ACTIVE) {
                    ctx.status = 400
                    return ctx.body = {
                        message: `Cant update AccessPoint Mode when Acu status is not ${acuStatus.ACTIVE}`
                    }
                }
                if ((Object.values(accessPointMode).indexOf(req_data.mode) === -1) && Object.values(accessPointMode).indexOf(req_data.exit_mode) === -1) {
                    if (req_data.mode !== 'open_once') {
                        ctx.status = 400
                        return ctx.body = {
                            message: `Invalid AccessPoint Mode ${req_data.mode} or Exit Mode`
                        }
                    }
                    if ('direction' in req_data) {
                        if (Object.values(accessPointDirection).indexOf(req_data.direction) === -1) {
                            ctx.status = 400
                            return ctx.body = {
                                message: `Invalid AccessPoint Direction ${req_data.direction}`
                            }
                        }
                        const single_pass_data: any = {
                            id: access_point.id,
                            direction: req_data.direction
                        }
                        CtpController.singlePass(location, access_point.acus.serial_number, single_pass_data, user, access_point.acus.session_id)
                        ctx.body = {
                            message: 'Open Once sent'
                        }
                    } else {
                        ctx.status = 400
                        return ctx.body = {
                            message: `direction is required when AccessPoint Mode is ${req_data.mode}`
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
                }
            }
            ctx.body = {
                message: 'update Pending'
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
     * /accessPoint/cardholders:
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
    public static async getAllForCardholder (ctx: DefaultContext) {
        const auth_user = ctx.user
        if (!auth_user.cardholder) {
            ctx.status = 400
            return ctx.body = { message: 'Only invited Cardholder can create Guest' }
        }
        const cardholder = await Cardholder.findOne({ where: { id: auth_user.cardholder } })
        if (!cardholder) {
            ctx.status = 400
            return ctx.body = { message: 'Cardholder not found' }
        }
        return ctx.body = await AccessRule.find({ where: { access_right: cardholder.access_right }, relations: ['access_points'] })
    }

    /**
     *
     * @swagger
     * /accessPoint/cameraSets:
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
    public static async getAccessPointsForCameraSet (ctx: DefaultContext) {
        try {
            const user = ctx.user
            const access_points = await AccessPoint.createQueryBuilder('access_point')
                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                .leftJoin('access_point.camera_sets', 'camera_set', 'camera_set.delete_date is null')
                .where('camera_set.id is null')
                .andWhere(`access_point.company = '${user.company ? user.company : null}'`)
                .andWhere(`acu.status = '${acuStatus.ACTIVE}'`)
                .getMany()

            ctx.body = access_points
        } catch (error) {
            console.log(222, error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
