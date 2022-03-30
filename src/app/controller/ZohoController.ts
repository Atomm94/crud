import { DefaultContext } from 'koa'
import { updateZohoConfig } from '../functions/zoho-utils'
import { Zoho } from '../model/entity/Zoho'
import { config } from '../../config'
import { postBodyRequestForToken } from '../services/requestUtil'
import { Company, Package } from '../model/entity'
import { zohoCallbackStatus } from '../enums/zohoCallbackStatus.enum'
import { statusCompany } from '../enums/statusCompany.enum'
import { Sendgrid } from '../../component/sendgrid/sendgrid'

export default class ZohoController {
    /**
     *
     * @swagger
     *  /zoho:
     *      post:
     *          tags:
     *              - Zoho
     *          summary: Creates a zoho.
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
     *              name: zoho
     *              description: The zoho to create.
     *              schema:
     *                  type: object
     *                  required:
     *                  properties:
     *                      client_id:
     *                          type: string
     *                          example: 1000.2075EZN43T60KMTNR1LEGY7SK63SNJ
     *                      client_secret:
     *                          type: string
     *                          example: 93e9d3a0f98085437bc1a0d61fe87ad02a797c30fe
     *                      code:
     *                          type: string
     *                          example: 1000.44563828ced176c0566d2d99757a0663.ad40e23c753d2f65ca5327d12db7a34b
     *                      scope:
     *                          type: string
     *                          example: ZohoCRM.modules.ALL
     *                      redirect_uri:
     *                          type: string
     *                          example: https://unimacs.studio-one.am/zoho
     *          responses:
     *              '201':
     *                  description: A zoho object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user

            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            const zoho = await Zoho.addItem(req_data as Zoho)
            ctx.body = zoho
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /zoho:
     *      put:
     *          tags:
     *              - Zoho
     *          summary: Update a zoho.
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
     *              name: zoho
     *              description: The zoho to create.
     *              schema:
     *                  type: object
     *                  required:
     *                    - id
     *                  properties:
     *                      id:
     *                          type: number
     *                          example: 1
     *                          client_id:
     *                              type: string
     *                              example: 1000.2075EZN43T60KMTNR1LEGY7SK63SNJ
     *                          client_secret:
     *                              type: string
     *                              example: 93e9d3a0f98085437bc1a0d61fe87ad02a797c30fe
     *                          code:
     *                              type: string
     *                              example: 1000.44563828ced176c0566d2d99757a0663.ad40e23c753d2f65ca5327d12db7a34b
     *                          scope:
     *                              type: string
     *                              example: ZohoCRM.modules.ALL
     *                          redirect_uri:
     *                              type: string
     *                              example: https://unimacs.studio-one.am
     *          responses:
     *              '201':
     *                  description: A zoho updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user

            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            const updated = await Zoho.updateItem(req_data as Zoho)
            await updateZohoConfig()
            ctx.oldData = updated.old
            ctx.body = updated.new
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
     * /zoho/{id}:
     *      get:
     *          tags:
     *              - Zoho
     *          summary: Return zoho by ID
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
            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }
            ctx.body = await Zoho.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /zoho:
     *      delete:
     *          tags:
     *              - Zoho
     *          summary: Delete a zoho.
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
     *              name: zoho
     *              description: The zoho to create.
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
     *                  description: zoho has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user
            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            const where = { id: req_data.id, company: user.company ? user.company : null }
            ctx.body = await Zoho.destroyItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /zoho:
     *      get:
     *          tags:
     *              - Zoho
     *          summary: Return zoho list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of zoho
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const user = ctx.user
            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            ctx.body = await Zoho.getAllItems({})
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /zoho/code:
     *      get:
     *          tags:
     *              - Zoho
     *          summary: Return zoho by ID
     *          parameters:
     *              - in: query
     *                name: code
     *                description: code of zoho
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async getCodeOfZoho (ctx: DefaultContext) {
        try {
            const code = ctx.query.code
            if (code) {
                console.log(code)
                const zoho: any = await Zoho.findOne()
                if (zoho) {
                    zoho.code = code
                    await zoho.save()
                    await updateZohoConfig()
                    const tokenBody = {
                        refresh_token: config.zoho.refresh_token,
                        client_id: config.zoho.client_id,
                        client_secret: config.zoho.client_secret,
                        redirect_uri: config.zoho.redirect_uri,
                        grant_type: 'refresh_token'
                    }
                    const linkForToken = 'https://accounts.zoho.com/oauth/v2/token'
                    let token: any = await postBodyRequestForToken(linkForToken, tokenBody)
                    token = JSON.parse(token)
                    zoho.access_token = token.access_token
                    await zoho.save()
                }
            }
            ctx.body = { success: true }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /zoho/callback:
     *      post:
     *          tags:
     *              - Zoho
     *          summary: callback url for zoho webhooks.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: body
     *              name: zoho
     *              description: The zoho to create.
     *              schema:
     *                  type: object
     *                  required:
     *                  properties:
     *                      customer:
     *                          type: object
     *                          properties:
     *                              customer_id:
     *                                  type: string
     *                                  example: '903000000000099'
     *                      status:
     *                          type: string
     *                          enum: [live, trial, dunning, unpaid, non_renewing, cancelled, creation_failed, cancelled_from_dunning, expired, trial_expired, future]
     *                          example: live
     *                      plan:
     *                          type: object
     *                          properties:
     *                              plan_code:
     *                                  type: string
     *                                  example: '15'
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async zohoCallback (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            console.log('req_data zohoCallback', req_data)

            const customer_id = req_data.customer.customer_id
            const package_id = req_data.plan.plan_code
            const coming_package = await Package.findOne({ id: package_id }) as Package
            const company: any = await Company.findOneOrFail({ where: { zoho_customer_id: customer_id }, relations: ['company_account'] })
            const status: zohoCallbackStatus = req_data.status
            const main = company.company_account
            switch (status) {
                case zohoCallbackStatus.LIVE:
                case zohoCallbackStatus.TRIAL:
                    if (company.status === statusCompany.PENDING) {
                        company.status = statusCompany.ENABLE
                    }
                    company.zoho_callback_status = status
                    company.package = package_id
                    company.upgraded_package_id = null
                    await company.save()

                    if (main) {
                        await Sendgrid.updateStatus(main.email)
                    }
                    break
                case zohoCallbackStatus.UNPAID:
                case zohoCallbackStatus.CANCELLED:
                case zohoCallbackStatus.CREATION_FAILED:
                case zohoCallbackStatus.EXPIRED:
                case zohoCallbackStatus.TRIAL_EXPIRED:
                    if (company.status === statusCompany.ENABLE) {
                        const default_package = await Package.findOne({ where: { package_type: coming_package.package_type, price: 0 } })
                        if (default_package) {
                            company.package = default_package.id
                        } else {
                            company.status = statusCompany.DISABLE
                       }
                    }
                    company.zoho_callback_status = status
                    await company.save()
                    break
                // case zohoCallbackStatus.NON_RENEWING:
                // case zohoCallbackStatus.DUNNING:
                // case zohoCallbackStatus.CANCELLED_FROM_DUNNING:
                // case zohoCallbackStatus.FUTURE:
                default:
                    break
            }

            ctx.body = { success: true }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
