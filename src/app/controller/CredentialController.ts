import { DefaultContext } from 'koa'
import { credentialType } from '../enums/credentialType.enum'
import { Credential } from '../model/entity/Credential'
// import { CheckCredentialSettings } from '../functions/check-credential'
import { AccessPoint, AccessRule, Cardholder, Company } from '../model/entity'
import { acuStatus } from '../enums/acuStatus.enum'
import CardKeyController from './Hardware/CardKeyController'
import { logUserEvents } from '../enums/logUserEvents.enum'
import * as jwt from 'jsonwebtoken'
import { accessPointDirection } from '../enums/accessPointDirection.enum'
import CtpController from './Hardware/CtpController'

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
            const credential: any = await Credential.findOne({ relations: ['cardholders'], where: where })
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
                value: { code: credential.code }
            })
            ctx.logsData = logs_data
            // const cardhoder = await Cardholder.findOneOrFail({ where: { id: credential.cardholder }, relations: ['access_rights', 'access_rights.access_rules'] })
            const cardhoder: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right', 'access_right.delete_date is null')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .where(`cardholder.id = '${credential.cardholder}'`)
                .getOne()
            if (!cardhoder) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Invalid Cardholder Id'
                }
            }

            credential.isDelete = true
            cardhoder.credentials = [credential]

            CardKeyController.editCardKey(location, user.company, user, null, access_points, [cardhoder])
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

                // const cardhoder = await Cardholder.findOneOrFail({ where: { id: credential.cardholder }, relations: ['access_rights', 'access_rights.access_rules'] })

                const cardhoder: any = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right', 'access_right.delete_date is null')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .where(`cardholder.id = '${credential.cardholder}'`)
                    .getOne()
                if (!cardhoder) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Invalid Cardholder Id'
                    }
                }

                cardhoder.credentials = [credential]

                CardKeyController.editCardKey(location, user.company, user, null, access_points, [cardhoder])
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

    /**
     *
     * @swagger
     *  /credential/login/{code}:
     *      post:
     *          tags:
     *              - Credential
     *          summary: credential(vikey) login.
     *          consumes:
     *              - application/json
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: false
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: path
     *                name: code
     *                required: true
     *                description: Code
     *                schema:
     *                    type: varchar
     *          responses:
     *              '201':
     *                  description: A token
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async login (ctx: DefaultContext) {
        try {
            const param_code = ctx.params.code
            let vikey_data
            if (ctx.vikey_data) {
                vikey_data = ctx.vikey_data
            }

            const credential_from_param: Credential | undefined = await Credential.findOne({ code: param_code, type: credentialType.VIKEY })

            if (vikey_data) {
                if (vikey_data.code !== param_code) {
                    const credential_from_token: Credential | undefined = await Credential.findOne({ code: vikey_data.code, type: credentialType.VIKEY })
                    if (!(credential_from_param && !credential_from_token)) {
                        ctx.status = 400
                        return ctx.body = { message: 'Wrong token and code!' }
                    }
                }
            }

            if (!credential_from_param) {
                ctx.status = 400
                ctx.body = { message: `Invalid code ${param_code}!` }
            } else {
                if (!vikey_data && credential_from_param.isLogin) {
                    ctx.status = 400
                    ctx.body = { message: `code ${param_code} already used!` }
                } else {
                    if (!vikey_data && !credential_from_param.isLogin) {
                        credential_from_param.isLogin = true
                        await credential_from_param.save()
                    }
                    const token = jwt.sign({ code: param_code, cardholder: credential_from_param.cardholder, company: credential_from_param.company }, 'jwtSecret')
                    ctx.body = {
                        token: token
                    }
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
     * /credential/accessPoints/{code}:
     *      get:
     *          tags:
     *              - Credential
     *          summary: Return accessPoints(from AccessRule) list of Cardholder
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: path
     *                name: code
     *                required: true
     *                description: Code
     *                schema:
     *                    type: varchar
     *          responses:
     *              '200':
     *                  description: Array of credential types
     *              '401':
     *                  description: Unauthorized
     */
    public static async getVikeyAccessPoints (ctx: DefaultContext) {
        try {
            const vikey_data = ctx.vikey_data
            const cardholder = await Cardholder.findOneOrFail({
                where: { id: vikey_data.cardholder, company: vikey_data.company },
                relations: ['limitations']
            })
            const access_rules = await AccessRule.getAllItems({
                where: { access_right: { '=': cardholder.access_right } },
                relations: ['access_points', 'access_points.acus', 'schedules', 'schedules.timeframes']
            })
            ctx.body = {
                limitations: cardholder.limitations,
                access_rules
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
     *  /credential/accessPoint/open/{code}:
     *      post:
     *          tags:
     *              - Credential
     *          summary: open door with credential(vikey).
     *          consumes:
     *              - application/json
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: path
     *                name: code
     *                required: true
     *                description: Code
     *                schema:
     *                    type: varchar
     *              - in: body
     *                name: credential
     *                description: Open AccessPoint from credential(vikey).
     *                schema:
     *                    type: object
     *                    required:
     *                      - access_point
     *                    properties:
     *                        access_point:
     *                            type: number
     *                            example: 1
     *          responses:
     *              '201':
     *                  description: A token
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async accessPointOpen (ctx: DefaultContext) {
        try {
            const vikey_data = ctx.vikey_data
            const access_point_id = ctx.request.body.access_point

            const cardholder = await Cardholder.findOneOrFail({ id: vikey_data.cardholder, company: vikey_data.company })

            const access_rule = await AccessRule.findOne({
                where: { access_right: cardholder.access_right, access_point: access_point_id },
                relations: ['access_points', 'access_points.acus']
            })
            if (!access_rule) {
                ctx.status = 400
                ctx.body = { message: `Invalid access_point ${access_point_id}!` }
            } else {
                if (access_rule.access_points.acus.status !== acuStatus.ACTIVE) {
                    ctx.status = 400
                    ctx.body = { message: `status of Acu must be ${acuStatus.ACTIVE}!` }
                } else {
                    const company = await Company.findOneOrFail({ id: vikey_data.company })
                    const location = `${company.account}/${vikey_data.company}`

                    const single_pass_data: any = {
                        id: access_point_id,
                        direction: accessPointDirection.ENTRY
                    }

                    CtpController.singlePass(location, access_rule.access_points.acus.serial_number, single_pass_data, {}, access_rule.access_points.acus.session_id)
                    ctx.body = {
                        message: 'Open Once sended'
                    }
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
