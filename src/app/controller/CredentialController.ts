import { DefaultContext } from 'koa'
import { credentialType } from '../enums/credentialType.enum'
import { Credential } from '../model/entity/Credential'
import { CheckCredentialSettings } from '../functions/check-credential'

export default class CredentialController {
    /**
     *
     * @swagger
     *  /credential:
     *      post:
     *          tags:
     *              - Credential
     *          summary: Creates a credential.
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
     *              name: credential
     *              description: The credential to create.
     *              schema:
     *                type: object
     *                required:
     *                - type
     *                - code
     *                - status
     *                - cardholder
     *                - facility
     *                - input_mode
     *                - company
     *                properties:
     *                  type:
     *                      type: rfid | pinpass | vikey| phone_bt | phone_nfc | fingerprint | face | face_temperature | car_lp_number
     *                      example: rfid
     *                  code:
     *                      type: string
     *                      example: 1245644
     *                  status:
     *                      type: active | stolen | lost
     *                      example: active
     *                  cardholder:
     *                      type: number
     *                      example: 1
     *                  facility:
     *                      type: number
     *                      example: 2
     *                  input_mode:
     *                      type: serial_number | wiegand_26
     *                      example: serial_number
     *                  company:
     *                       type:number
     *                       example:1
     *          responses:
     *              '201':
     *                  description: A credential object
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
            const check = CheckCredentialSettings.checkSettings(req_data)
            if (check !== true) {
                ctx.status = 400
                return ctx.body = { message: check }
            }
            ctx.body = await Credential.addItem(ctx.request.body as Credential)
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
     *  /credential:
     *      put:
     *          tags:
     *              - Credential
     *          summary: Update a credential.
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
     *              name: credential
     *              description: The credential to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  type:
     *                      type: rfid | pinpass | vikey| phone_bt | phone_nfc | fingerprint | face | face_temperature | car_lp_number
     *                      example: rfid
     *                  code:
     *                      type: string
     *                      example: 1245644
     *                  status:
     *                      type: active | stolen | lost
     *                      example: active
     *                  cardholder:
     *                      type: number
     *                      example: 1
     *                  facility:
     *                      type: number
     *                      example: 2
     *                  input_mode:
     *                      type: serial_number | wiegand_26
     *                      example: serial_number
     *          responses:
     *              '201':
     *                  description: A credential updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await Credential.updateItem(ctx.request.body as Credential)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /credential/{id}:
     *      get:
     *          tags:
     *              - Credential
     *          summary: Return credential by ID
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
            ctx.body = await Credential.getItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /credential:
     *      delete:
     *          tags:
     *              - Credential
     *          summary: Delete a credential.
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
     *              name: credential
     *              description: The credential to create.
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
     *                  description: credential has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Credential.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await Credential.destroyItem(req_data as { id: number })
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
     * /credential:
     *      get:
     *          tags:
     *              - Credential
     *          summary: Return credential list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of credential
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            ctx.body = await Credential.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /credential/updateStatus:
     *      put:
     *          tags:
     *              - Credential
     *          summary: Update a credential status.
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
     *              name: credential
     *              description: update credential status.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                  - status
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  status:
     *                      type: ACTIVE | STOLEN | LOST
     *                      example: ACTIVE
     *          responses:
     *              '201':
     *                  description: A credential updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateStatus (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Credential.findOne(where)
            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await Credential.updateItem(req_data as Credential)
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
     * /credential/types:
     *      get:
     *          tags:
     *              - Credential
     *          summary: Return credential type list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of credential types
     *              '401':
     *                  description: Unauthorized
     */
    public static async getCredentialTypes (ctx: DefaultContext) {
        try {
            ctx.body = Object.values(credentialType)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
