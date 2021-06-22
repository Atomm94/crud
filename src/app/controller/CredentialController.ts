import { DefaultContext } from 'koa'
import { credentialType } from '../enums/credentialType.enum'
import { Credential } from '../model/entity/Credential'
// import { CheckCredentialSettings } from '../functions/check-credential'
import { AccessPoint, Cardholder } from '../model/entity'
import { acuStatus } from '../enums/acuStatus.enum'
import CardKeyController from './Hardware/CardKeyController'
import { logUserEvents } from '../enums/logUserEvents.enum'

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
            // const req_data = ctx.request.body
            // const user = ctx.user

            ctx.body = true
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
            const user = ctx.user
            const location = `${user.company_main}/${user.company}`
            const req_data = ctx.request.body
            const logs_data = []
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const credential:any = await Credential.findOne({ relations: ['cardholders'], where: where })
            credential.status = 0
            req_data.where = { company: { '=': user.company ? user.company : null }, status: { '=': acuStatus.ACTIVE } }
            const access_points = await AccessPoint.createQueryBuilder('access_point')
            .innerJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
            .where(`acu.status = '${acuStatus.ACTIVE}'`)
            .andWhere(`acu.company = ${ctx.user.company}`)
            .getMany()
            ctx.body = await Credential.destroyItem(where)
            logs_data.push({
                event: logUserEvents.DELETE,
                target: `${Credential.name}/${credential.cardholders.first_name}/${credential.code}`,
                value: null
            })
            ctx.logsData = logs_data
            const cardhoder = await Cardholder.findOneOrFail({ id: credential.cardholder })
            cardhoder.credentials = [credential]
            CardKeyController.editCardKey(location, req_data.company, user, null, access_points, [cardhoder])
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
     *                      type: active | stolen | lost
     *                      example: active
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
                const location = `${user.company_main}/${user.company}`
                const credential: any = await Credential.getItem({ id: req_data.id })
                credential.status = req_data.status
                req_data.where = { company: { '=': user.company ? user.company : null }, status: { '=': acuStatus.ACTIVE } }
                const access_points = await AccessPoint.createQueryBuilder('access_point')
                .innerJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`acu.company = ${ctx.user.company}`)
                .getMany()

                console.log('credential', credential)

                const cardhoder = await Cardholder.findOneOrFail({ id: credential.cardholder })
                console.log('cardhoder', cardhoder)
                cardhoder.credentials = [credential]

                CardKeyController.editCardKey(location, req_data.company, user, null, access_points, [cardhoder])
                // const acus: any = await Acu.getAllItems(req_data)
                // acus.forEach((acu: any) => {
                //     access_points.forEach((access_point: any) => {
                //         credential.access_point = access_point.id
                //         new SendDeviceMessage(OperatorType.EDIT_KEY, location, acu.serial_number, credential, acu.session_id)
                //     })
                // })
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
