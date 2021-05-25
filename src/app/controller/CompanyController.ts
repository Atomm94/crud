import { DefaultContext } from 'koa'
import { In } from 'typeorm'
import { uid } from 'uid'
import { Sendgrid } from '../../component/sendgrid/sendgrid'
import { statusCompany } from '../enums/statusCompany.enum'
import {
    RegistrationInvite,
    Company,
    Admin,
    Role
} from '../model/entity/index'
import { JwtToken } from '../model/entity/JwtToken'

export default class CompanyController {
    /**
     *
     * @swagger
     *  /company:
     *      post:
     *          tags:
     *              - Company
     *          summary: Creates a company.
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
     *              name: company
     *              description: The company to create.
     *              schema:
     *                type: object
     *                required:
     *                  - company_name
     *                  - package_type
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  company_name:
     *                      type: string
     *                      example: some_company_name
     *                  package:
     *                      type: number
     *                      example: 1
     *                  package_type:
     *                      type: number
     *                      example: 1
     *                  message:
     *                      type: string
     *                      example: some_message
     *                  status:
     *                      type: pending | disable | enable
     *                      example: pending
     *          responses:
     *              '201':
     *                  description: A company object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await Company.addItem(ctx.request.body as Company)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /company:
     *      put:
     *          tags:
     *              - Company
     *          summary: Update a company.
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
     *              name: company
     *              description: The company to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  company_name:
     *                      type: string
     *                      example: some_company_name
     *                  package:
     *                      type: number
     *                      example: 1
     *                  package_type:
     *                      type: number
     *                      example: 1
     *                  message:
     *                      type: string
     *                      example: some_message
     *                  status:
     *                      type: pending | disable | enable
     *                      example: pending
     *          responses:
     *              '201':
     *                  description: A company updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_id = ctx.request.body.id
            if (!req_id && ctx.user && ctx.user.company) {
                ctx.request.body.id = ctx.user.company
            }
            const updated = await Company.updateItem(ctx.request.body as Company, req_id ? ctx.user : null)
            if (updated.old.status !== updated.new.status && updated.new.status === statusCompany.ENABLE) {
                const main = await Admin.findOne({ id: updated.new.account })
                if (main) {
                    await Sendgrid.updateStatus(main.email)
                }
            }
            ctx.oldData = updated.old
            ctx.body = updated.new
        } catch (error) {
            ctx.status = error.status || 400
            if (error.message) {
                ctx.body = {
                    message: error.message
                }
            } else {
                ctx.body = error
            }
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /company/{id}:
     *      get:
     *          tags:
     *              - Company
     *          summary: Return company by ID
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
            const relations = ['company_account', 'packages', 'package_types', 'company_documents']
            ctx.body = await Company.getItem(+ctx.params.id, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /serviceCompany:
     *      get:
     *          tags:
     *              - Company
     *          summary: Return company by partner
     *          parameters:
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
    public static async getServiceCompany (ctx: DefaultContext) {
        try {
            if (ctx.user && ctx.user.company) {
                const relations = ['company_account', 'company_documents']
                let company

                if (ctx.user.companyData && ctx.user.companyData.parent_id) {
                    company = await Company.getItem(ctx.user.companyData.parent_id, relations)
                } else {
                    company = await Company.getItem(+ctx.user.company, relations)
                }
                ctx.body = company
            } else {
                ctx.status = 400
                ctx.body = {
                    status: 400,
                    message: 'Company dose not exists'
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
     * /clientCompany:
     *      get:
     *          tags:
     *              - Company
     *          summary: Return company by partner
     *          parameters:
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
    public static async getClientCompany (ctx: DefaultContext) {
        try {
            if (ctx.user && ctx.user.company) {
                const relations = ['company_account']
                if (!ctx.user.companyData.parent_id) {
                    relations.push('company_documents')
                } ctx.body = await Company.getItem(+ctx.user.company, relations)
            } else {
                ctx.status = 400
                ctx.body = {
                    status: 400,
                    message: 'Company dose not exists'
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
     *  /company:
     *      delete:
     *          tags:
     *              - Company
     *          summary: Delete a company.
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
     *              name: company
     *              description: The company to create.
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
     *                  description: company has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user: any = ctx.user
            const where: any = { id: req_data.id }
            if (user.company) where.parent_id = user.company

            ctx.body = await Company.destroyItem(where)
            const users: any = await Admin.getAllItems({ where: { company: { '=': req_data.id } } })
            for (const user of users) {
                user.status = false
                await user.save()
            }
            const tokens = await JwtToken.find({ where: { account: In(users.map((user: Admin) => { return user.id })), expired: false } })
            for (const token of tokens) {
                token.expired = true
                await token.save()
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
     * /company:
     *      get:
     *          tags:
     *              - Company
     *          summary: Return company list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: page
     *                description: page number
     *                schema:
     *                    type: number
     *              - in: query
     *                name: page_items_count
     *                description: page items count
     *                schema:
     *                    type: number
     *              - in: query
     *                name: start_date
     *                description: start date
     *                schema:
     *                    type: string
     *              - in: query
     *                name: end_date
     *                description: end date
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of company
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const where: any = {}
            if (ctx.user.company) {
                where.parent_id = {
                    '=': ctx.user.company
                }
            }

            if (req_data.start_date || req_data.end_date) {
                if (req_data.start_date && req_data.end_date) {
                    where.createDate = { between: [req_data.start_date, req_data.end_date] }
                } else {
                    if (req_data.start_date) {
                        where.createDate = { '>=': req_data.start_date }
                    } else {
                        where.createDate = { '<=': req_data.end_date }
                    }
                }
            }

            req_data.where = where
            req_data.relations = ['company_account', 'packages', 'package_types', 'company_documents']
            ctx.body = await Company.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /registration/{token}:
     *      post:
     *          tags:
     *              - Company
     *          summary: Create company, account and send emails
     *          parameters:
     *              - in: path
     *                name: token
     *                required: true
     *                description: token
     *                schema:
     *                    type: string
     *              - in: body
     *                name: regForm
     *                description: The registration of Partner.
     *                schema:
     *                  type: object
     *                  required:
     *                      - company
     *                      - account
     *                  properties:
     *                      company:
     *                          type: object
     *                          required:
     *                              - company_name
     *                              - package_type
     *                          properties:
     *                              company_name:
     *                                  type: string
     *                                  example: some_company_name
     *                              package_type:
     *                                  type: number
     *                                  example: 1
     *                              message:
     *                                  type: string
     *                                  example: some_message
     *                      account:
     *                          type: object
     *                          required:
     *                              - first_name
     *                              - last_name
     *                              - email
     *                              - phone_1
     *                              - post_code
     *                          properties:
     *                              first_name:
     *                                  type: string
     *                                  example: John
     *                              last_name:
     *                                  type: string
     *                                  example: Smith
     *                              email:
     *                                  type: string
     *                                  example: example@gmail.com
     *                              phone_1:
     *                                  type: string
     *                                  example: +374XXXXXXXX
     *                              post_code:
     *                                  type: number
     *                                  example: 0068
     *
     *                              avatar:
     *                                  type: string
     *                                  example: avatar
     *                              phone_2:
     *                                  type: string
     *                                  example: +374XXXXXXXX
     *                              country:
     *                                  type: string
     *                                  example: Armenia
     *                              site:
     *                                  type: string
     *                                  example: https://unimax.com
     *                              address:
     *                                  type: string
     *                                  example: some_address
     *                              viber:
     *                                  type: string
     *                                  example: +374XXXXXXXX
     *                              whatsapp:
     *                                  type: string
     *                                  example: +374XXXXXXXX
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async regValidation (ctx: DefaultContext) {
        try {
            const token = ctx.params.token
            const regToken = await RegistrationInvite.findOne({ token: token, used: false })
            if (regToken) {
                const req_data = ctx.request.body
                const company_data = req_data.company
                const account_data = req_data.account

                if (!('first_name' in account_data && 'last_name' in account_data && 'email' in account_data && 'phone_1' in account_data && 'post_code' in account_data)) {
                    ctx.status = 400
                    ctx.body = {
                        message: 'Fill in required inputs!!'
                    }
                } else {
                    if (await Admin.findOne({ email: account_data.email })) {
                        ctx.status = 400
                        ctx.body = {
                            message: 'Duplicate email!!'
                        }
                    } else {
                        if (regToken.company) company_data.parent_id = regToken.company
                        const company = await Company.addItem(company_data as Company)

                        let permissions: string = JSON.stringify(Role.default_partner_role)
                        const default_role = await Role.findOne({ slug: 'default_partner' })
                        if (default_role) {
                            permissions = default_role.permissions
                        }
                        const role_save_data = {
                            slug: company.company_name,
                            company: company.id,
                            permissions: permissions,
                            main: true
                        }
                        const new_company_role = await Role.addItem(role_save_data as Role)

                        account_data.company = company.id
                        account_data.verify_token = uid(32)
                        account_data.role = new_company_role.id
                        const admin = await Admin.addItem(account_data as Admin)

                        company.account = admin.id
                        await Company.save(company)
                        await Sendgrid.sendNewPass(admin.email, admin.verify_token as string)

                        // set registration token to null
                        regToken.used = true
                        await regToken.save()
                        ctx.body = {
                            success: true
                        }
                    }
                }
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
     * /registration/{token}:
     *      put:
     *          tags:
     *              - Company
     *          summary: Resend confirmation Email
     *          parameters:
     *              - in: path
     *                name: token
     *                required: true
     *                description: token
     *                schema:
     *                    type: string
     *              - in: body
     *                name: regForm
     *                description: The registration of Partner.
     *                schema:
     *                  type: object
     *                  required:
     *                      - company
     *                      - account
     *                  properties:
     *                      email:
     *                          type: string
     *                          example: example@example.com
     *
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async resendNewPassEmail (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const admin = await Admin.findOneOrFail({ email: reqData.email })
            if (admin.verify_token) {
                await Sendgrid.sendNewPass(admin.email, admin.verify_token)
                ctx.body = {
                    success: true
                }
            } else {
                ctx.status = 400
                ctx.body = {
                    success: false
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
