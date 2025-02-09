import { DefaultContext } from 'koa'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { PackageType } from '../model/entity/PackageType'
export default class PackageTypeController {
    /**
     *
     * @swagger
     *  /packageType:
     *      post:
     *          tags:
     *              - PackageType
     *          summary: Creates a packageType.
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
     *              name: packageType
     *              description: The packageType to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  status:
     *                      type: boolean
     *                  default:
     *                      type: boolean
     *          responses:
     *              '201':
     *                  description: A packageType object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const old_default_package: any = await PackageType.createQueryBuilder('package_type')
                .where(`package_type.default = ${true}`)
                .getOne()
            if (old_default_package) {
                if (req_data.default) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'There are Default Package type'
                    }
                }
            }
            ctx.body = await PackageType.addItem(ctx.request.body as PackageType)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /packageType:
     *      put:
     *          tags:
     *              - PackageType
     *          summary: Update a packageType.
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
     *              name: packageType
     *              description: The packageType to create.
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
     *                  status:
     *                      type: boolean
     *                  default:
     *                      type: boolean
     *          responses:
     *              '201':
     *                  description: A packageType updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            const old_default_package_type: any = await PackageType.createQueryBuilder('package_type')
                .where(`package_type.default = ${true}`)
                .getOne()
            if (old_default_package_type && old_default_package_type.id !== req_data.id && req_data.default === true) {
                ctx.status = 400
                return ctx.body = { message: 'Default Package Type can be only one' }
            }
            if (old_default_package_type && old_default_package_type.id === req_data.id && req_data.default === false) {
                ctx.status = 400
                return ctx.body = { message: "Can't checkout Default Package Type" }
            }

            const updated = await PackageType.updateItem(req_data as PackageType)
            ctx.oldData = updated.old
            ctx.body = updated.new
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /packageType/{id}:
     *      get:
     *          tags:
     *              - PackageType
     *          summary: Return packageType by ID
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
            ctx.body = await PackageType.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /packageType:
     *      delete:
     *          tags:
     *              - PackageType
     *          summary: Delete a packageType.
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
     *              name: packageType
     *              description: The packageType to create.
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
     *                  description: packageType has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const where = { id: req_data.id }
            const package_data = await PackageType.findOneOrFail({ where: where })

            if (package_data.default) {
                ctx.status = 400
                return ctx.body = { message: "Can't delete Default Package Type" }
            }

            ctx.body = await PackageType.destroyItem(where)
            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${PackageType.name}/${package_data.name}`,
                value: { name: package_data.name }
            }]
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /packageType:
     *      get:
     *          tags:
     *              - PackageType
     *          summary: Return packageType list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of packageType
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await PackageType.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
