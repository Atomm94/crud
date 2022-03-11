import { DefaultContext } from 'koa'
import { RegistrationInvite } from '../model/entity/RegistrationInvite'
import { PackageType } from '../model/entity/PackageType'
import { Company } from '../model/entity'

export default class RegistrationInviteController {
    /**
     *
     * @swagger
     *  /registrationInvite:
     *      post:
     *          tags:
     *              - RegistrationInvite
     *          summary: Creates a registrationInvite.
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
     *              name: registrationInvite
     *              description: The registrationInvite to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  email:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A registrationInvite object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            if (user.company) {
                const company: any = await Company.findOneOrFail({ where: { id: user.company }, relations: ['packages', 'company_resources', 'package_types'] })
                const extra_settings = JSON.parse(company.packages.extra_settings)
                const used = JSON.parse(company.company_resources.used)
                if (!company.package_types.service) {
                    if (used.Company >= extra_settings.resources.Company) {
                        ctx.status = 400
                        return ctx.body = { message: 'Can\'t invite. PackageResource limit reached!' }
                    }
                    ctx.body = await RegistrationInvite.createPartitionLink(req_data as RegistrationInvite)
                } else {
                    let limit_complete = true
                    for (const package_type in extra_settings.package_types) {
                        if (extra_settings.package_types[package_type]) {
                            if (!used[package_type] || (used[package_type] && used[package_type] < extra_settings.package_types[package_type])) {
                                limit_complete = false
                                break
                            }
                        }
                    }
                    if (limit_complete) {
                        ctx.status = 400
                        return ctx.body = { message: 'Can\'t invite. PackageResource limit reached!' }
                    }
                }

                if (user.company) req_data.company = user.company
                ctx.body = await RegistrationInvite.createLink(req_data as RegistrationInvite)
            }
            ctx.logsData = []
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    // /**
    //  *
    //  * @swagger
    //  *  /registrationInvite:
    //  *      put:
    //  *          tags:
    //  *              - RegistrationInvite
    //  *          summary: Update a registrationInvite.
    //  *          consumes:
    //  *              - application/json
    //  *          parameters:
    //  *            - in: header
    //  *              name: Authorization
    //  *              required: true
    //  *              description: Authentication token
    //  *              schema:
    //  *                type: string
    //  *            - in: body
    //  *              name: registrationInvite
    //  *              description: The registrationInvite to create.
    //  *              schema:
    //  *                type: object
    //  *                required:
    //  *                  - id
    //  *                properties:
    //  *                  id:
    //  *                      type: number
    //  *                      example: 1
    //  *                  email:
    //  *                      type: string
    //  *                  token:
    //  *                      type: string
    //  *                  used:
    //  *                      type: boolean
    //  *          responses:
    //  *              '201':
    //  *                  description: A registrationInvite updated object
    //  *              '409':
    //  *                  description: Conflict
    //  *              '422':
    //  *                  description: Wrong data
    //  */
    // public static async update (ctx: DefaultContext) {
    //     try {
    //         ctx.body = await RegistrationInvite.updateItem(ctx.request.body as RegistrationInvite)
    //     } catch (error) {
    //         ctx.status = error.status || 400
    //         ctx.body = error
    //     }
    //     return ctx.body
    // }

    /**
     *
     * @swagger
     * /registration/{token}:
     *      get:
     *          tags:
     *              - RegistrationInvite
     *          summary: Return registrationInvite by token
     *          parameters:
     *              - name: token
     *                in: path
     *                required: true
     *                description: Parameter description
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
            // ctx.body = await RegistrationInvite.getByLink(ctx.params.token)
            const token = ctx.params.token

            const regToken = await RegistrationInvite.findOneOrFail({ token: token, used: false })
            if (regToken) {
                let packageTypes: any = []
                if (regToken.company) {
                    const parent_company: any = await Company.findOneOrFail({ where: { id: regToken.company }, relations: ['packages', 'company_resources', 'package_types'] })
                    const extra_settings = JSON.parse(parent_company.packages.extra_settings)
                    const used = JSON.parse(parent_company.company_resources.used)
                    const package_type_ids = []
                    for (const package_type in extra_settings.package_types) {
                        if (extra_settings.package_types[package_type]) {
                            if (!used[package_type] || (used[package_type] && used[package_type] < extra_settings.package_types[package_type])) {
                                package_type_ids.push(package_type)
                            }
                        }
                    }

                    if (package_type_ids.length) {
                        packageTypes = await PackageType.getAllItems({ where: { status: { '=': true }, service: { '=': false }, id: { in: package_type_ids } } })
                    }
                } else {
                    packageTypes = await PackageType.getAllItems({ where: { status: { '=': true } } })
                }
                ctx.body = packageTypes
            } else {
                ctx.status = 400
                ctx.body = {
                    message: 'Wrong token!!'
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
     * /registration/registrationOfPartition/{token}:
     *      get:
     *          tags:
     *              - RegistrationInvite
     *          summary: Return registrationInvite by token
     *          parameters:
     *              - name: token
     *                in: path
     *                required: true
     *                description: Parameter description
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async getPartition (ctx: DefaultContext) {
        try {
            // ctx.body = await RegistrationInvite.getByLink(ctx.params.token)
            const token = ctx.params.token

            const regToken = await RegistrationInvite.findOneOrFail({ token: token })
            console.log(regToken)

            if (regToken) {
                if (regToken.company) {
                    ctx.body = true
                } else {
                    ctx.status = 400
                    ctx.body = {
                        message: 'Wrong Company!!'
                    }
                }
            } else {
                ctx.status = 400
                ctx.body = {
                    message: 'Wrong Token!!'
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    // /**
    //  *
    //  * @swagger
    //  *  /registrationInvite:
    //  *      delete:
    //  *          tags:
    //  *              - RegistrationInvite
    //  *          summary: Delete a registrationInvite.
    //  *          consumes:
    //  *              - application/json
    //  *          parameters:
    //  *            - in: header
    //  *              name: Authorization
    //  *              required: true
    //  *              description: Authentication token
    //  *              schema:
    //  *                type: string
    //  *            - in: body
    //  *              name: registrationInvite
    //  *              description: The registrationInvite to create.
    //  *              schema:
    //  *                type: object
    //  *                required:
    //  *                  - id
    //  *                properties:
    //  *                  id:
    //  *                      type: number
    //  *                      example: 1
    //  *          responses:
    //  *              '200':
    //  *                  description: registrationInvite has been deleted
    //  *              '422':
    //  *                  description: Wrong data
    //  */
    // public static async destroy (ctx: DefaultContext) {
    //     try {
    //         ctx.body = await RegistrationInvite.destroyItem(ctx.request.body as { id: number })
    //     } catch (error) {
    //         ctx.status = error.status || 400
    //         ctx.body = error
    //     }
    //     return ctx.body
    // }

    // /**
    //  *
    //  * @swagger
    //  * /registrationInvite:
    //  *      get:
    //  *          tags:
    //  *              - RegistrationInvite
    //  *          summary: Return registrationInvite list
    //  *          parameters:
    //  *              - in: header
    //  *                name: Authorization
    //  *                required: true
    //  *                description: Authentication token
    //  *                schema:
    //  *                    type: string
    //  *          responses:
    //  *              '200':
    //  *                  description: Array of registrationInvite
    //  *              '401':
    //  *                  description: Unauthorized
    //  */
    // public static async getAll (ctx: DefaultContext) {
    //     try {
    //         ctx.body = await RegistrationInvite.getAllItems(ctx.query)
    //     } catch (error) {
    //         ctx.status = error.status || 400
    //         ctx.body = error
    //     }
    //     return ctx.body
    // }
}
