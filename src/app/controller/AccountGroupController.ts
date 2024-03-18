import { DefaultContext } from 'koa'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { AccessPointGroup, Admin, Company } from '../model/entity'
import { AccountGroup } from '../model/entity/AccountGroup'
export default class AccountGroupController {
    /**
     *
     * @swagger
     *  /accountGroup:
     *      post:
     *          tags:
     *              - AccountGroup
     *          summary: Creates a accountGroup.
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
     *              name: accountGroup
     *              description: The accountGroup to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                      example: APT 50
     *                  description:
     *                      type: string
     *                      example: description
     *                  parent_id:
     *                      type: number | null
     *                      example: 5
     *                  role:
     *                      type: number | null
     *                      example: 5
     *          responses:
     *              '201':
     *                  description: A accountGroup object
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
            ctx.body = await AccountGroup.addItem(req_data as AccountGroup)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accountGroup:
     *      put:
     *          tags:
     *              - AccountGroup
     *          summary: Update a accountGroup.
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
     *              name: accountGroup
     *              description: The accountGroup to create.
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
     *                      example: APT 50
     *                  description:
     *                      type: string
     *                      example: description
     *                  parent_id:
     *                      type: number | null
     *                      example: 5
     *                  role:
     *                      type: number | null
     *                      example: 5
     *          responses:
     *              '201':
     *                  description: A accountGroup updated object
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
            const check_by_company = await AccountGroup.findOne({ where })

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const updated = await AccountGroup.updateItem(ctx.request.body as AccountGroup)
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
     * /accountGroup/{id}:
     *      get:
     *          tags:
     *              - AccountGroup
     *          summary: Return accountGroup by ID
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
            const id: number = +ctx.params.id
            const where = { id: id, company: user.company ? user.company : user.company }
            const relations = ['users', 'companies']

            ctx.body = await AccountGroup.getItem(where, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /accountGroup:
     *      delete:
     *          tags:
     *              - AccountGroup
     *          summary: Delete a accountGroup.
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
     *              name: accountGroup
     *              description: The accountGroup to create.
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
     *                  description: accountGroup has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }

            const childs = await AccountGroup.find({ where: { parent_id: req_data.id } })
            if (childs.length) {
                ctx.status = 400
                ctx.body = { message: 'Can\'t remove group with childs' }
            } else {
                const admins = await Admin.find({ where: { account_group: req_data.id } })
                if (admins.length) {
                    for (const admin of admins) {
                        admin.account_group = null
                        await admin.save()
                    }
                } else {
                    const account_group = await AccountGroup.findOneOrFail({ where: where })
                    ctx.body = await AccountGroup.destroyItem(where)
                    ctx.logsData = [{
                        event: logUserEvents.DELETE,
                        target: `${AccessPointGroup.name}/${account_group.name}`,
                        value: { name: account_group.name }
                    }]
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
     * /accountGroup:
     *      get:
     *          tags:
     *              - AccountGroup
     *          summary: Return accountGroup list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of accountGroup
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            req_data.relations = { users: Admin, companies: Company }
            ctx.body = await AccountGroup.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /accountGroup/relations/{id}:
     *      get:
     *          tags:
     *              - AccountGroup
     *          summary: Return accountGroup with group by accounts
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
     *                  description: Array of accountGroup
     *              '401':
     *                  description: Unauthorized
     */
    public static async getGroupAccountsCounts (ctx: DefaultContext) {
        try {
            const user = ctx.user
            ctx.body = await AccountGroup.getGroupByAccounts(+ctx.params.id, user.company ? user.company : null)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
