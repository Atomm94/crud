import { DefaultContext } from 'koa'
import { uid } from 'uid'
import { Sendgrid } from '../../component/sendgrid/sendgrid'
import config from '../../config'

import { Company } from '../model/entity/Company'
import { Admin } from '../model/entity/Admin'
import { RegistrationInvite } from '../model/entity/RegistrationInvite'

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
     *                properties:
     *                  company_name:
     *                      type: string
     *                  product:
     *                      type: number
     *                  message:
     *                      type: string
     *                  status:
     *                      type: string
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
     *                  product:
     *                      type: number
     *                  message:
     *                      type: string
     *                  status:
     *                      type: string
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
            ctx.body = await Company.updateItem(ctx.request.body as Company)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
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
            ctx.body = await Company.getItem(+ctx.params.id)
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
            ctx.body = await Company.destroyItem(ctx.request.body as { id: number })
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
     *          responses:
     *              '200':
     *                  description: Array of company
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await Company.getAllItems(ctx.query)
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
     *                              - packet_type
     *                          properties:
     *                              company_name:
     *                                  type: string
     *                                  example: some_company_name
     *                              packet_type:
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
     *                              - uid
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
            // check token
            const token = ctx.params.token
            console.log('token', token)

            const regToken = await RegistrationInvite.findOne({ token: token, used: false })
            if (regToken) {
                const req_data = ctx.request.body
                const company_data = req_data.company
                const account_data = req_data.account

                const company: any = await Company.addItem(company_data as Company)
                account_data.company = company.id
                account_data.verify_token = uid(32)
                const admin: any = await Admin.addItem(account_data as Admin)
                // send email (link with verify_token)
                const msg = {
                    to: `${admin.email}`,
                    from: 'g.israelyan@studio-one.am',
                    subject: 'You have been invited to Unimacs',
                    text: 'has invited you',
                    html: `<h1>Unimacs company has invited you to make a registration. Please click link bellow ${config.cors.origin}/newpassword/${admin.verify_token}</h1>`
                }
                await Sendgrid.send(msg)

                // set registration token to null
                regToken.used = true
                await regToken.save()
                ctx.body = {
                    success: true
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
}
