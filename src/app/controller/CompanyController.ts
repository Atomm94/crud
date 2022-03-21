import { DefaultContext } from 'koa'
import { uid } from 'uid'
import { Sendgrid } from '../../component/sendgrid/sendgrid'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { statusCompany } from '../enums/statusCompany.enum'
import {
    RegistrationInvite,
    Company,
    Admin,
    Role,
    Schedule
} from '../model/entity/index'
import { JwtToken } from '../model/entity/JwtToken'
import * as Models from '../model/entity/index'
import { canCreate } from '../middleware/resource'
import { partition_unnecessary_roles, outUnnecessaryRoles } from '../model/entity/partitionUnnecessaryRoles'

import { AccessPoint } from '../model/entity/AccessPoint'
import { AccessRight } from '../model/entity/AccessRight'

import { In } from 'typeorm'
import { scheduleType } from '../enums/scheduleType.enum'

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
     *                      type: string
     *                      enum: [pending, disable, enable]
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
     *                      type: string
     *                      enum: [pending, disable, enable]
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
            const req_data = ctx.request.body
            if (req_data.schedule_id) {
                const base_schedule = await Schedule.findOne({ where: { id: req_data.schedule_id, custom: false } })
                if (!base_schedule) {
                    ctx.status = 400
                    ctx.body = {
                        message: { message: 'Invalid schedule_id' }
                    }
                } else if (base_schedule.type !== scheduleType.WEEKLY) {
                    ctx.status = 400
                    ctx.body = {
                        message: { message: `base Schedule type must be ${scheduleType.WEEKLY}` }
                    }
                }
            }
            const updated = await Company.updateItem(req_data as Company, req_id ? ctx.user : null)
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
            const company = await Company.findOneOrFail({ where: where })
            ctx.body = await Company.destroyItem(where)
            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Company.name}/${company.company_name}`,
                value: { company_name: company.company_name }
            }]
            const accounts: any = await Admin.getAllItems({ where: { company: { '=': req_data.id } } })
            for (const account of accounts) {
                account.status = false
                await account.save()
            }
            JwtToken.logoutAccounts(req_data.id, accounts)
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
                        if (regToken.company) {
                            company_data.parent_id = regToken.company
                            company_data.status = statusCompany.PENDING
                        }
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
            console.log(error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /registration/regPartition/{token}:
     *      post:
     *          tags:
     *              - Company
     *          summary: Create Partition, account and send emails
     *          parameters:
     *              - in: path
     *                name: token
     *                required: true
     *                description: token
     *                schema:
     *                    type: string
     *              - in: body
     *                name: regForm
     *                description: The registration of Partition.
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
     *                          properties:
     *                              company_name:
     *                                  type: string
     *                                  example: some_company_name
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
    public static async regPartitionValidation (ctx: DefaultContext) {
        try {
            const token = ctx.params.token
            const regToken = await RegistrationInvite.findOne({ token: token, used: false })
            const company_invite = await Company.findOne({ where: { id: regToken?.company } })
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
                        if (company_invite) {
                            company_data.partition_parent_id = company_invite.id
                            company_data.package = company_invite.package
                            company_data.package_type = company_invite.package_type
                            company_data.status = statusCompany.ENABLE
                        }
                        const role = await Role.findOne({ where: { company: company_invite?.id, main: true } })
                        let permissions: string = '' /* JSON.stringify(Role.default_partner_role) */
                        if (role) {
                            permissions = role.permissions
                        }
                        const final_permissions = outUnnecessaryRoles(permissions, partition_unnecessary_roles)

                        const company = await Company.addItem(company_data as Company)
                        const role_save_data = {
                            slug: company.company_name,
                            company: company.id,
                            permissions: JSON.stringify(final_permissions),
                            main: false
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
            console.log(error)

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

    /**
     *
     * @swagger
     * /company/companyResource:
     *      get:
     *          tags:
     *              - Company
     *          summary: Return boolaen
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: resource
     *                required: true
     *                description: check resource limit (enum - (AccessPoint, AccessRight, AccountGroup, Admin, Cardholder, CardholderGroup, EventLog, Schedule, UserLog))
     *                schema:
     *                    type: string
     *                    enum: [AccessPoint, AccessRight, AccountGroup, Admin, Cardholder, CardholderGroup, EventLog, Schedule, UserLog]
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async checkResourceLimit (ctx: DefaultContext) {
        try {
            const resource = ctx.query.resource
            const company = ctx.user.company
            const models: any = Models
            if (!models[resource] || !models[resource].resource) {
                ctx.status = 400
                ctx.body = {
                    message: 'Invalid Resource!'
                }
            } else {
                const can = await canCreate(company, resource)
                ctx.body = {
                    success: can
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
     * /company/partitions:
     *      get:
     *          tags:
     *              - Company
     *          summary: Return partition list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of company
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAllPartitions (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const where: any = {}
            console.log(865656565)

            if (ctx.user.company) {
                where.partition_parent_id = {
                    '=': ctx.user.company
                }
            }
            req_data.where = where
            req_data.relations = ['company_account']
            console.log('req', req_data)

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
     *  /company/updatePartition:
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
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  company_name:
     *                      type: string
     *                      example: 'Studio-One'
     *                  first_name:
     *                      type: string
     *                      example: 'Oleg'
     *                  phone_1:
     *                      type: string
     *                      example: '+374885566'
     *                  email:
     *                      type: string
     *                      example: 'Oleg@gmail.com'
     *                  message:
     *                      type: string
     *                      example: 'description'
     *                  access_right:
     *                      type: number
     *                      example: 1
     *                  base_access_points:
     *                      type: Array<number>
     *                      example: [1,2]
     *          responses:
     *              '201':
     *                  description: A company updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updatePartition (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const company = await Company.findOne({ where: { id: req_data.id, partition_parent_id: ctx.user.company } }) as Company
            if (!company) {
                ctx.status = 400
                    ctx.body = { message: 'Invalid Compnany' }
                    }
                const sended_access_points = req_data.base_access_points
                if (sended_access_points) {
                    const access_points = await AccessPoint.find({ where: { id: In(sended_access_points) } })

                    if (access_points) {
                        req_data.base_access_points = access_points.map(item => item.id)
                    }
                }
                const sended_access_right = req_data.access_right
                if (sended_access_right) {
                    const access_right = await AccessRight.findOne({ where: { id: sended_access_right } })
                    if (access_right) {
                        req_data.access_right = access_right.id
                    }
                }
                const updated = await Company.updateItem(req_data as Company)
                const admin_data = {
                    id: company.account,
                    first_name: req_data.first_name,
                    phone1: req_data.phone1,
                    email: req_data.email
                }

                await Admin.updateItem(admin_data)

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
}
