import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
import { Limitation } from '../model/entity/Limitation'
import { Cardholder } from '../model/entity/Cardholder'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { Credential } from '../model/entity/Credential'
import { acuStatus } from '../enums/acuStatus.enum'
import { AccessPoint, AccessRight, AccessRule, Admin, Role, Schedule } from '../model/entity'
import { OperatorType } from '../mqtt/Operators'
import { CheckCredentialSettings } from '../functions/check-credential'
import { Sendgrid } from '../../component/sendgrid/sendgrid'
import { uid } from 'uid'
import { validate } from '../functions/passValidator'
import { scheduleCustomType } from '../enums/scheduleCustomType.enum'
import { Timeframe } from '../model/entity/Timeframe'
import SdlController from './Hardware/SdlController'
import CardKeyController from './Hardware/CardKeyController'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { cardholderStatus } from '../enums/cardholderStatus.enum'
import { credentialStatus } from '../enums/credentialStatus.enum'

// import SendDeviceMessage from '../mqtt/SendDeviceMessage'
// import { OperatorType } from '../mqtt/Operators'

export default class CardholderController {
    /**
     *
     * @swagger
     *  /cardholder:
     *      post:
     *          tags:
     *              - Cardholder
     *          summary: Creates a cardholder.
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
     *              name: cardholder
     *              description: The cardholder to create.
     *              schema:
     *                type: object
     *                required:
     *                  - email
     *                  - first_name
     *                  - last_name
     *                  - family_name
     *                  - phone
     *                  - cardholder_group
     *                properties:
     *                    email:
     *                        type: string
     *                        example: example@gmail.com
     *                    avatar:
     *                        type: string
     *                        example: some_avatar
     *                    password:
     *                        type: string
     *                        example: some_password
     *                    first_name:
     *                        type: string
     *                        example: some_first_name
     *                    last_name:
     *                        type: string
     *                        example: some_last_name
     *                    family_name:
     *                        type: string
     *                        example: some_family_name
     *                    phone:
     *                        type: string
     *                        example: +374 XX XXX XXX
     *                    company_name:
     *                        type: string
     *                        example: some_company_name
     *                    user_account:
     *                        type: boolean
     *                        example: false
     *                    cardholder_group:
     *                        type: number
     *                        example: 1
     *                    status:
     *                        type: inactive | active | expired | noCredential | pending
     *                        example: active
     *                    car_infos:
     *                        type: object
     *                        required:
     *                        properties:
     *                            model:
     *                                type: string
     *                                example: bmw
     *                            color:
     *                                type: string
     *                                example: some_color
     *                            lp_number:
     *                                type: string
     *                                example: 1
     *                            car_credential:
     *                                type: string
     *                                example: some_car_credential
     *                            car_event:
     *                                type: boolean
     *                                example: true
     *                            avatar:
     *                                type: string
     *                                example: {}
     *                    limitation_inherited:
     *                        type: boolean
     *                        example: true
     *                    limitations:
     *                        type: object
     *                        properties:
     *                            enable_date:
     *                                type: boolean
     *                                example: true
     *                            valid_from:
     *                                type: string
     *                                example: 2020-04-04 00:00:00
     *                            valid_due:
     *                                type: string
     *                                example: 2020-05-05 15:00:00
     *                            pass_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            pass_counter_passes:
     *                                type: number
     *                                example: 25
     *                            pass_counter_current:
     *                                type: number
     *                                example: 10
     *                            first_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            first_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            first_use_counter_current:
     *                                type: number
     *                                example: 10
     *                            last_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            last_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            last_use_counter_current:
     *                                type: number
     *                                example: 10
     *                    antipass_back_inherited:
     *                        type: boolean
     *                        example: false
     *                    enable_antipass_back:
     *                        type: boolean
     *                        example: false
     *                    time_attendance_inherited:
     *                        type: boolean
     *                        example: false
     *                    time_attendance:
     *                        type: number
     *                        example: 1
     *                    access_right_inherited:
     *                        type: boolean
     *                        example: false
     *                    access_right:
     *                        type: number
     *                        example: 1
     *                    credentials:
     *                        type: array
     *                        items:
     *                            type: object
     *                            properties:
     *                                type:
     *                                    type: string
     *                                    enum: [rfid, pinpass, vikey, phone_bt, phone_nfc, fingerprint, face, face_temperature, car_lp_number]
     *                                    example: rfid
     *                                code:
     *                                    type: string
     *                                    example: 1245644
     *                                status:
     *                                    type: string
     *                                    enum: [active, stolen, lost]
     *                                    example: active
     *                                cardholder:
     *                                    type: number
     *                                    example: 1
     *                                facility:
     *                                    type: number
     *                                    example: 2
     *                                input_mode:
     *                                    type: string
     *                                    enum: [serial_number, wiegand_26]
     *                                    example: serial_number
     *                                company:
     *                                     type:number
     *                                     example:1
     *          responses:
     *              '201':
     *                  description: A cardholder object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            const auth_user = ctx.user
            const location = `${auth_user.company_main}/${auth_user.company}`
            const company = auth_user.company ? auth_user.company : null
            req_data.company = company
            req_data.create_by = auth_user.id

            const logs_data = []

            const check_credentials = await CheckCredentialSettings.checkSettings(req_data.credentials, company)
            if (check_credentials !== true) {
                ctx.status = 400
                return ctx.body = { message: check_credentials }
            }

            const check_virt_keys = await CheckCredentialSettings.checkVirtualKeys(req_data.credentials, company)
            if (check_virt_keys !== true) {
                ctx.status = 403
                return ctx.body = { message: check_virt_keys }
            }

            const check_key_per_user = await CheckCredentialSettings.checkKeyPerUser(req_data.credentials, company)
            if (check_key_per_user !== true) {
                ctx.status = 403
                return ctx.body = { message: check_key_per_user }
            }

            let group_data: any
            if (req_data.limitation_inherited || req_data.antipass_back_inherited || req_data.time_attendance_inherited || req_data.access_right_inherited) {
                group_data = await CardholderGroup.getItem({ id: req_data.cardholder_group, company: company })
            }

            if (req_data.limitation_inherited && group_data) {
                req_data.limitation = group_data.limitation
            } else {
                const limitation_data = await Limitation.addItem(req_data.limitations as Limitation)
                if (limitation_data) {
                    req_data.limitation = limitation_data.id
                }
            }

            // if (req_data.antipass_back_inherited && group_data) {
            //     req_data.antipass_back = group_data.antipass_back
            // } else {
            //     const antipass_back_data = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
            //     if (antipass_back_data) {
            //         req_data.antipass_back = antipass_back_data.id
            //     }
            // }

            if (req_data.antipass_back_inherited && group_data) {
                req_data.enable_antipass_back = group_data.enable_antipass_back
            }

            if (req_data.access_right_inherited && group_data) {
                req_data.access_right = group_data.access_right
            }

            if (req_data.time_attendance_inherited && group_data) {
                req_data.time_attendance = group_data.time_attendance
            }
            if (req_data.car_infos) {
                const car_info = await CarInfo.addItem(req_data.car_infos as CarInfo)
                if (car_info) {
                    req_data.car_info = car_info.id
                }
            }
            const cardholder: Cardholder = await Cardholder.addItem(req_data as Cardholder)
            logs_data.push({
                event: logUserEvents.CREATE,
                target: `${Cardholder.name}/${cardholder.first_name}`,
                value: { name: cardholder.first_name }
            })

            if (req_data.credentials && req_data.credentials.length) {
                // const keys_count = calculateCredentialsKeysCountToSendDevice(req_data)

                const credentials: any = []
                for (const credential of req_data.credentials) {
                    credential.company = company
                    credential.cardholder = cardholder.id
                    const credential_data: any = await Credential.addItem(credential as Credential)
                    logs_data.push({
                        event: logUserEvents.CREATE,
                        target: `${Credential.name}/${cardholder.first_name}/${credential_data.type}`,
                        value: { code: credential_data.code }
                    })
                    credentials.push(credential_data)

                    req_data.where = { status: { '=': acuStatus.ACTIVE } }
                }
                if (credentials.length) {
                    cardholder.credentials = credentials

                    const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                        .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                        .where(`access_right.id = '${cardholder.access_right}'`)
                        .getOne()

                    if (access_rights) {
                        cardholder.access_rights = access_rights
                        CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, company, auth_user, null, [cardholder], null)
                    }
                }
            }

            if (cardholder) {
                const cardholder_data = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    // .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                    .leftJoinAndSelect('cardholder.time_attendances', 'time_attendance')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.id = '${cardholder.id}'`)
                    .getOne()
                ctx.body = cardholder_data
                ctx.logsData = logs_data
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
     *  /cardholder:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: Update a cardholder.
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
     *              name: cardholder
     *              description: The cardholder to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  email:
     *                      type: string
     *                      example: example@gmail.com
     *                  avatar:
     *                      type: string
     *                      example: some_avatar
     *                  password:
     *                      type: string
     *                      example: some_password
     *                  first_name:
     *                      type: string
     *                      example: some_first_name
     *                  last_name:
     *                      type: string
     *                      example: some_last_name
     *                  family_name:
     *                      type: string
     *                      example: some_family_name
     *                  phone:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  company_name:
     *                      type: string
     *                      example: some_company_name
     *                  user_account:
     *                      type: boolean
     *                      example: false
     *                  cardholder_group:
     *                      type: number
     *                      example: 1
     *                  status:
     *                      type: inactive | active | expired | noCredential | pending
     *                      example: active
     *                  car_infos:
     *                      type: object
     *                      required:
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          model:
     *                              type: string
     *                              example: bmw
     *                          color:
     *                              type: string
     *                              example: some_color
     *                          lp_number:
     *                              type: string
     *                              example: 1
     *                          car_credential:
     *                              type: string
     *                              example: some_car_credential
     *                          car_event:
     *                              type: boolean
     *                              example: true
     *                          avatar:
     *                              type: string
     *                              example: {}
     *                  limitation_inherited:
     *                      type: boolean
     *                      example: true
     *                  limitations:
     *                      type: object
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          enable_date:
     *                              type: boolean
     *                              example: true
     *                          valid_from:
     *                              type: string
     *                              example: 2020-04-04 00:00:00
     *                          valid_due:
     *                              type: string
     *                              example: 2020-05-05 15:00:00
     *                          pass_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          pass_counter_passes:
     *                              type: number
     *                              example: 25
     *                          pass_counter_current:
     *                              type: number
     *                              example: 10
     *                          first_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          first_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          first_use_counter_current:
     *                              type: number
     *                              example: 10
     *                          last_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          last_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          last_use_counter_current:
     *                              type: number
     *                              example: 10
     *                  antipass_back_inherited:
     *                      type: boolean
     *                      example: false
     *                  enable_antipass_back:
     *                        type: boolean
     *                        example: false
     *                  time_attendance_inherited:
     *                      type: boolean
     *                      example: false
     *                  time_attendance:
     *                      type: number
     *                      example: 1
     *                  access_right_inherited:
     *                      type: boolean
     *                      example: false
     *                  access_right:
     *                      type: number
     *                      example: 1
     *                  credentials:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              type:
     *                                  type: rfid | pinpass | vikey| phone_bt | phone_nfc | fingerprint | face | face_temperature | car_lp_number
     *                                  example: rfid
     *                              code:
     *                                  type: string
     *                                  example: 1245644
     *                              status:
     *                                  type: string
     *                                  enum: [active, stolen, lost]
     *                                  example: active
     *                              cardholder:
     *                                  type: number
     *                                  example: 1
     *                              facility:
     *                                  type: number
     *                                  example: 2
     *                              input_mode:
     *                                  type: serial_number | wiegand_26
     *                                  example: serial_number
     *                              company:
     *                                   type:number
     *                                   example:1
     *          responses:
     *              '201':
     *                  description: A cardholder updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const auth_user = ctx.user
            const company = auth_user.company ? auth_user.company : null
            const where = { id: req_data.id, company: company }
            const check_by_company = await Cardholder.findOne(where)

            const logs_data = []

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const check_credentials = await CheckCredentialSettings.checkSettings(req_data.credentials, company)
                const location = `${auth_user.company_main}/${auth_user.company}`

                if (check_credentials !== true) {
                    ctx.status = 400
                    return ctx.body = { message: check_credentials }
                }

                const check_virt_keys = await CheckCredentialSettings.checkVirtualKeys(req_data.credentials, company)
                if (check_virt_keys !== true) {
                    ctx.status = 403
                    return ctx.body = { message: check_virt_keys }
                }

                const check_key_per_user = await CheckCredentialSettings.checkKeyPerUser(req_data.credentials, company)
                if (check_key_per_user !== true) {
                    ctx.status = 403
                    return ctx.body = { message: check_key_per_user }
                }

                const res_data = await Cardholder.updateItem(req_data as Cardholder, auth_user)

                logs_data.push(...res_data.logs_data)
                logs_data.push({
                    event: logUserEvents.CHANGE,
                    target: `${Cardholder.name}/${res_data.old.first_name}`,
                    value: res_data
                })
                const cardholder = res_data.new

                const credentials: any = []
                const old_credentials: any = []
                if (req_data.credentials && req_data.credentials.length) {
                    // const keys_count = calculateCredentialsKeysCountToSendDevice(req_data)

                    for (const credential of req_data.credentials) {
                        if (!credential.id) {
                            credential.company = auth_user.company
                            credential.cardholder = req_data.id
                            const credential_data: any = await Credential.addItem(credential as Credential)
                            logs_data.push({
                                event: logUserEvents.CREATE,
                                target: `${Credential.name}/${cardholder.first_name}/${credential_data.type}`,
                                value: credential_data
                            })
                            credentials.push(credential_data)
                        } else {
                            old_credentials.push(credential)
                        }
                    }

                    const limitations = await Limitation.findOne({ where: { id: req_data.limitations.id } })
                    cardholder.limitations = limitations

                    if (req_data.limitations && limitations &&
                        (req_data.limitations.valid_from !== limitations.valid_from ||
                            req_data.limitations.valid_due !== limitations.valid_due)
                    ) {
                        CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, auth_user.company, auth_user, null)
                    } else {
                        if (credentials.length || old_credentials.length) {
                            const access_points: AccessPoint[] = await AccessPoint.createQueryBuilder('access_point')
                                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                                .andWhere(`acu.company = ${ctx.user.company}`)
                                .select('access_point.id')
                                .getMany()

                            if (access_points.length) {
                                // const access_rights = await AccessRight.findOne({ where: { id: cardholder.access_right }, relations: ['access_rules'] })
                                const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                                    .where(`access_right.id = '${cardholder.access_right}'`)
                                    .getOne()

                                if (access_rights) {
                                    cardholder.access_rights = access_rights

                                    if (credentials.length) {
                                        cardholder.credentials = credentials
                                        CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, auth_user.company, auth_user, null, [cardholder], null)
                                    }

                                    if (res_data.old.vip !== res_data.new.vip && old_credentials.length) {
                                        cardholder.credentials = old_credentials
                                        CardKeyController.editCardKey(location, company, auth_user.id, null, access_points, [cardholder])
                                    }
                                }
                            }
                        }
                    }
                }

                ctx.oldData = res_data.old
                ctx.body = res_data.new

                const cardholder_data = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    // .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                    .leftJoinAndSelect('cardholder.time_attendances', 'schedule')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.id = '${req_data.id}'`)
                    .getOne()
                ctx.body = cardholder_data
                ctx.logsData = logs_data
            }
        } catch (error) {
            console.log('error', error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /cardholder/{id}:
     *      get:
     *          tags:
     *              - Cardholder
     *          summary: Return cardholder by ID
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

            const cardholder = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                .leftJoinAndSelect('cardholder.limitations', 'limitation')
                // .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                .leftJoinAndSelect('cardholder.time_attendances', 'schedule')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                .where(`cardholder.id = '${+ctx.params.id}'`)
                .andWhere(`cardholder.company = ${user.company}`)
                .getOne()
            ctx.body = cardholder
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /cardholder:
     *      delete:
     *          tags:
     *              - Cardholder
     *          summary: Delete a cardholder.
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
     *              name: cardholder
     *              description: The cardholder to create.
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
     *                  description: cardholder has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const location = `${user.company_main}/${user.company}`
            const where = { id: req_data.id, company: user.company ? user.company : null }
            req_data.where = { company: { '=': user.company ? user.company : null }, status: { '=': acuStatus.ACTIVE } }
            const cardholder = await Cardholder.findOneOrFail({ where: where })
            ctx.body = await Cardholder.destroyItem(where)

            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Cardholder.name}/${cardholder.first_name}`,
                value: { name: cardholder.first_name }
            }]
            CardKeyController.dellKeys(location, user.company, req_data, user)
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
     * /cardholder:
     *      get:
     *          tags:
     *              - Cardholder
     *          summary: Return cardholder list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of cardholder
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            // const req_data = ctx.query
            const user = ctx.user
            // const where: any = { company: { '=': user.company ? user.company : null } }

            // req_data.relations = ['car_infos', 'limitations', 'antipass_backs', 'time_attendances', 'access_rights', 'cardholder_groups', 'credentials']

            let cardholders: any
            if (user.cardholder) {
                // where.guest = { '=': false }
                // where.create_by = { '=': user.id }
                // req_data.relations = ['limitations', 'access_rights', 'credentials']
                cardholders = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.company = '${user.company ? user.company : null}'`)
                    .andWhere(`cardholder.guest = ${false}`)
                    .andWhere(`cardholder.create_by = '${user.id}'`)
                    .getMany()
            } else {
                cardholders = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    // .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                    .leftJoinAndSelect('cardholder.time_attendances', 'schedule')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.company = '${user.company ? user.company : null}'`)
                    .getMany()
            }
            // req_data.where = where
            // ctx.body = await Cardholder.getAllItems(req_data)
            ctx.body = cardholders
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /cardholder/guests:
     *      get:
     *          tags:
     *              - Cardholder
     *          summary: Return guests list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of guests
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAllGuests (ctx: DefaultContext) {
        try {
            // const req_data = ctx.query
            const user = ctx.user
            // req_data.where = {
            //     company: { '=': user.company ? user.company : null },
            //     guest: { '=': true },
            //     create_by: { '=': user.id }
            // }
            // req_data.relations = ['limitations', 'access_rights', 'credentials']
            // ctx.body = await Cardholder.getAllItems(req_data)

            const cardholders = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.limitations', 'limitation')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                .where(`cardholder.company = '${user.company ? user.company : null}'`)
                .andWhere(`cardholder.guest = ${true}`)
                .andWhere(`cardholder.create_by = '${user.id}'`)
                .getMany()
            ctx.body = cardholders
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /cardholder/image:
     *      post:
     *          tags:
     *              - Cardholder
     *          summary: Upload cardholder image.
     *          consumes:
     *              - multipart/form-data
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                    type: string
     *            - in: formData
     *              name: file
     *              type: file
     *              description: The upload cardholder image.
     *          responses:
     *              '201':
     *                  description: image upload
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async cardholderImageSave (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = await Cardholder.saveImage(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /cardholder/image:
     *      delete:
     *          tags:
     *              - Cardholder
     *          summary: Delete an cardholder image.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *              type: string
     *            - in: body
     *              name: file
     *              description: The cardholder image name to delete.
     *              schema:
     *                type: string
     *                required:
     *                  - name
     *                properties:
     *                  name:
     *                      type: string
     *          responses:
     *              '200':
     *                  description: Cardholder image has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async cardholderImageDelete (ctx: DefaultContext) {
        const name = ctx.request.body.name

        try {
            Cardholder.deleteImage(name)
            ctx.body = {
                success: true
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
     *  /cardholder/bulk:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: Update a multiple cardholders.
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
     *              name: multiple cardholders
     *              description: The multiple cardholders to update.
     *              schema:
     *                type: object
     *                required:
     *                  - ids
     *                  - data
     *                properties:
     *                    ids:
     *                        type: array
     *                        items: number
     *                        example: [1, 2]
     *                    data:
     *                        type: object
     *                        properties:
     *                            status:
     *                                type: inactive | active | expired | noCredential | pending
     *                                example: active
     *                            cardholder_group:
     *                                type: number
     *                                example: 1
     *          responses:
     *              '201':
     *                  description: A multiple cardholders update
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateMultipleCardholders (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            if (!req_data.ids || !req_data.data || !(req_data.data.status || req_data.data.cardholder_group)) {
                ctx.status = 400
                ctx.body = {
                    message: 'Incorrect params!!'
                }
            } else {
                const user = ctx.user
                const where = {
                    company: { '=': user.company ? user.company : null },
                    id: { in: req_data.ids }
                }
                const cardholders = await Cardholder.getAllItems({ where: where })
                for (const cardholder of cardholders) {
                    if (req_data.data.status) {
                        cardholder.status = req_data.data.status
                    }
                    if (req_data.data.cardholder_group) {
                        cardholder.cardholder_group = req_data.data.cardholder_group
                    }
                    await cardholder.save()
                }

                ctx.body = { success: true }
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
     *  /cardholder/inviteCardholder:
     *      post:
     *          tags:
     *              - Cardholder
     *          summary: Create a cardholder.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                    type: string
     *            - in: body
     *              name: admin
     *              description: The admin to create.
     *              schema:
     *                type: object
     *                required:
     *                  - email
     *                properties:
     *                  email:
     *                      type: string
     *                      example: example@gmail.com
     *          responses:
     *              '201':
     *                  description: A admin object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async inviteCardholder (ctx: DefaultContext) {
        const reqData = ctx.request.body
        const user = ctx.user
        const company = (user.company) ? user.company : null
        try {
            const cardholder: any = await Cardholder.findOneOrFail({ email: reqData.email })
            reqData.company = company
            reqData.verify_token = uid(32)
            reqData.cardholder = cardholder.id

            const role_slug = 'default_cardholder'
            let default_cardholder_role = await Role.findOne({ slug: role_slug, company: company })
            console.log('default_cardholder_role', default_cardholder_role)

            if (!default_cardholder_role) {
                const permissions: string = JSON.stringify(Role.default_cardholder_role)
                // permissions = default_cardholder_role.permissions
                const role_save_data = {
                    slug: role_slug,
                    company: cardholder.company,
                    permissions: permissions
                }
                default_cardholder_role = await Role.addItem(role_save_data as Role)
            }

            reqData.role = default_cardholder_role.id
            reqData.first_name = cardholder.first_name
            const newAdmin: Admin = await Admin.addItem(reqData, user)

            ctx.body = { success: true }
            if (newAdmin.verify_token) {
                await Sendgrid.sendCardholderInvite(newAdmin.email, newAdmin.verify_token)
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
            console.log(error)

            if (error.detail && error.detail.includes('email')) {
                ctx.body.err = 'email'
                ctx.body.errorMsg = `email ${reqData.email} already exists.`
            }
            return ctx.body
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /cardholder/invite/{token}:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: Set Cardholder password
     *          parameters:
     *              - in: path
     *                name: token
     *                required: true
     *                description: account description
     *                schema:
     *                    type: string
     *                    minimum: 1
     *              - in: body
     *                name: passForm
     *                description: The setting of password.
     *                schema:
     *                  type: object
     *                  required:
     *                      - password
     *                  properties:
     *                      password:
     *                          type: string
     *                          example: 123456
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async setCardholderPassword (ctx: DefaultContext) {
        const verify_token: string = ctx.params.token
        const user = await Admin.findOne({ verify_token: verify_token })
        if (user) {
            const password = ctx.request.body.password
            if (validate(password).success) {
                user.password = password
                user.verify_token = null
                await user.save()
                ctx.body = {
                    success: true
                }
            } else {
                ctx.status = 400
                ctx.body = {
                    message: validate(password).message
                }
            }
        } else {
            ctx.status = 400
            ctx.body = {
                message: 'Wrong token!!'
            }
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /cardholder/guest:
     *      post:
     *          tags:
     *              - Cardholder
     *          summary: Creates a cardholder.
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
     *              name: cardholder
     *              description: The cardholder to create.
     *              schema:
     *                type: object
     *                required:
     *                  - first_name
     *                properties:
     *                    first_name:
     *                        type: string
     *                        example: some_first_name
     *                    status:
     *                        type: string
     *                        enum: [inactive, active, expired, noCredential, pending]
     *                        example: active
     *                    limitations:
     *                        type: object
     *                        properties:
     *                            enable_date:
     *                                type: boolean
     *                                example: true
     *                            valid_from:
     *                                type: string
     *                                example: 2020-04-04 00:00:00
     *                            valid_due:
     *                                type: string
     *                                example: 2020-05-05 15:00:00
     *                            pass_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            pass_counter_passes:
     *                                type: number
     *                                example: 25
     *                            pass_counter_current:
     *                                type: number
     *                                example: 10
     *                            first_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            first_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            first_use_counter_current:
     *                                type: number
     *                                example: 10
     *                            last_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            last_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            last_use_counter_current:
     *                                type: number
     *                                example: 10
     *                    schedule_type:
     *                        type: string
     *                        enum: [default, daily, weekly]
     *                        example: default
     *                    access_points:
     *                        type: Array<number>
     *                        example: [1]
     *                    timeframes:
     *                        type: array
     *                        items:
     *                            type: object
     *                            properties:
     *                                name:
     *                                    type: string
     *                                    example: sun
     *                                start:
     *                                    type: string
     *                                    example: 08:00
     *                                end:
     *                                    type: string
     *                                    example: 09:30
     *          responses:
     *              '201':
     *                  description: A cardholder object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async addGuest (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            const auth_user = ctx.user
            const location = `${auth_user.company_main}/${auth_user.company}`
            req_data.company = auth_user.company ? auth_user.company : null
            req_data.create_by = auth_user.id
            req_data.guest = true

            if (!auth_user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can create Guest' }
            }

            // console.log('invite_user', auth_user)
            // const invite_user: Cardholder = await Cardholder.findOneOrFail({
            //     relations: ['access_rights', 'access_rights.access_rules'],
            //     where: { id: auth_user.cardholder }
            // })

            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getOne()
            // console.log('invite_user', invite_user)

            const access_point_ids = req_data.access_points
            const timeframes = req_data.timeframes

            const access_rigth: any = await AccessRight.addItem({ name: req_data.first_name, company: invite_user.company } as AccessRight)
            req_data.access_right = access_rigth.id

            let schedule: any
            if (req_data.schedule_type && req_data.schedule_type !== scheduleCustomType.DEFAULT) {
                schedule = await Schedule.addItem({
                    name: req_data.first_name,
                    type: req_data.schedule_type,
                    custom: true,
                    company: invite_user.company
                } as Schedule)
            }

            if (access_point_ids && access_point_ids.length) {
                for (const access_rule of invite_user.access_rights.access_rules) {
                    if (schedule) access_rule.schedule = schedule.id
                    access_rule.access_right = access_rigth.id
                    await AccessRule.addItem(access_rule)
                }
            }

            if (timeframes && timeframes.length && schedule) {
                for (const timeframe of timeframes) {
                    timeframe.schedule = schedule.id
                    timeframe.company = invite_user.company
                    await Timeframe.addItem(timeframe)
                }
            }

            const limitation_data = await Limitation.addItem(req_data.limitations as Limitation)
            if (limitation_data) {
                req_data.limitation = limitation_data.id
            }

            if (schedule) req_data.schedule = schedule.id
            const cardholder: Cardholder = await Cardholder.addItem(req_data as Cardholder)

            const credential: any = await Credential.addItem({
                company: req_data.company,
                cardholder: cardholder.id,
                code: uid(32)
            } as Credential)

            req_data.where = { status: { '=': acuStatus.ACTIVE } }

            const access_points = await AccessPoint.createQueryBuilder('access_point')
                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`acu.company = ${ctx.user.company}`)
                .select('access_point.id')
                .getMany()

            if (access_points.length) {
                // const access_rights = await AccessRight.findOneOrFail({
                //     where: { id: cardholder.access_right },
                //     relations: [
                //         'access_rules',
                //         'access_rules.schedules',
                //         'access_rules.schedules.timeframes',
                //         'access_rules.access_points',
                //         'access_rules.access_points.acus'
                //     ]
                // })
                const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                    .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                    .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                    .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                    .where(`access_right.id = '${cardholder.access_right}'`)
                    .getOne()

                for (const access_rule of access_rights.access_rules) {
                    if (access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                        SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, auth_user, access_rule.access_points.acus.session_id)
                    }
                }

                cardholder.access_rights = access_rights
                cardholder.credentials = [credential]

                CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, req_data.company, auth_user, access_points, [cardholder], null)
            }

            // const where = { id: cardholder.id }
            // const relations = ['limitations', 'access_rights', 'credentials']
            // ctx.body = await Cardholder.getItem(where, relations)

            const cardholders: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.limitations', 'limitation')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                .where(`access_right.id = '${cardholder.id}'`)
                .getOne()
            ctx.body = cardholders
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /cardholder/guest:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: Update a cardholder(guest).
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
     *              name: cardholder
     *              description: The cardholder to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  first_name:
     *                      type: string
     *                      example: some_first_name
     *                  status:
     *                      type: string
     *                      enum: [inactive, active, expired, noCredential, pending]
     *                      example: active
     *                  limitations:
     *                      type: object
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          enable_date:
     *                              type: boolean
     *                              example: true
     *                          valid_from:
     *                              type: string
     *                              example: 2020-04-04 00:00:00
     *                          valid_due:
     *                              type: string
     *                              example: 2020-05-05 15:00:00
     *                          pass_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          pass_counter_passes:
     *                              type: number
     *                              example: 25
     *                          pass_counter_current:
     *                              type: number
     *                              example: 10
     *                          first_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          first_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          first_use_counter_current:
     *                              type: number
     *                              example: 10
     *                          last_use_counter_enable:
     *                              type: boolean
     *                              example: true
     *                          last_use_counter_days:
     *                              type: number
     *                              example: 25
     *                          last_use_counter_current:
     *                              type: number
     *                              example: 10
     *                  schedule_type:
     *                      type: string
     *                      enum: [default, daily, weekly]
     *                      example: default
     *                  access_points:
     *                      type: Array<number>
     *                      example: [1]
     *                  timeframes:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              name:
     *                                  type: string
     *                                  example: sun
     *                              start:
     *                                  type: string
     *                                  example: 08:00
     *                              end:
     *                                  type: string
     *                                  example: 09:30
     *          responses:
     *              '201':
     *                  description: A cardholder updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateGuest (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            const auth_user = ctx.user
            const company = auth_user.company ? auth_user.company : null
            const location = `${auth_user.company_main}/${company}`

            if (!auth_user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can update Guest' }
            }

            // const invite_user: Cardholder = await Cardholder.findOneOrFail({
            //     relations: [
            //         'access_rights',
            //         'access_rights.access_rules',
            //         'access_rights.access_rules.access_points',
            //         'access_rights.access_rules.access_points.acus'
            //     ],
            //     where: { id: auth_user.cardholder }
            // })

            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getOne()

            // const guest: Cardholder = await Cardholder.findOneOrFail({
            //     relations: [
            //         'access_rights',
            //         'access_rights.access_rules',
            //         'access_rights.access_rules.access_points',
            //         'access_rights.access_rules.access_points.acus'
            //     ],
            //     where: { id: req_data.id, company: company }
            // })

            const guest: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`cardholder.id = '${req_data.id}'`)
                .andWhere(`cardholder.company = '${company}'`)
                .getOne()

            const access_point_ids = req_data.access_points ? req_data.access_points : []

            const timeframes = req_data.timeframes
            let new_schedule: any
            let new_timeframes: any

            if (req_data.schedule_type && req_data.schedule_type !== guest.schedule_type) {
                for (const guest_access_rule of guest.access_rights.access_rules) {
                    const acu = guest_access_rule.access_points.acus
                    if (acu.status === acuStatus.ACTIVE) {
                        console.log('guest_access_rule', guest_access_rule)

                        const schedule: Schedule = await Schedule.findOneOrFail({ id: guest_access_rule.schedule })
                        console.log('schedule', schedule)
                        const send_data = { id: guest_access_rule.id, access_point: guest_access_rule.access_points.id }
                        SdlController.delSdl(location, acu.serial_number, send_data, auth_user, schedule.type, acu.session_id)
                    } else {
                        await AccessRule.destroyItem(guest_access_rule)
                    }
                }

                if (guest.schedule) {
                    await Schedule.destroyItem({ id: guest.schedule, company: company })
                }
                if (req_data.schedule_type === scheduleCustomType.DEFAULT) {
                    req_data.schedule = null
                } else {
                    new_schedule = await Schedule.addItem({
                        name: guest.first_name,
                        type: req_data.schedule_type,
                        custom: true,
                        company: invite_user.company
                    } as Schedule)
                    if (timeframes && timeframes.length) {
                        new_timeframes = []
                        for (const timeframe of timeframes) {
                            timeframe.schedule = new_schedule.id
                            timeframe.company = invite_user.company
                            new_timeframes.push(await Timeframe.addItem(timeframe))
                        }
                    }

                    req_data.schedule = new_schedule.id
                }

                for (let access_rule of invite_user.access_rights.access_rules) {
                    for (const access_point_id of access_point_ids) {
                        if (access_point_ids && access_point_ids.length) {
                            if (access_point_id === access_rule.access_point) {
                                const acu = access_rule.access_points.acus
                                access_rule.access_right = guest.access_right
                                if (new_schedule) {
                                    access_rule.schedule = new_schedule.id
                                }
                                access_rule = await AccessRule.addItem(access_rule)

                                if (acu.status === acuStatus.ACTIVE) {
                                    SdlController.setSdl(location, acu.serial_number, access_rule, auth_user, acu.session_id)

                                    // const cardholders = await Cardholder.getAllItems({
                                    //     relations: ['credentials'],
                                    //     where: {
                                    //         access_right: guest.access_right,
                                    //         company: company
                                    //     }
                                    // })

                                    const cardholders: any = await Cardholder.createQueryBuilder('cardholder')
                                        .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                                        .where(`cardholder.company = '${company}'`)
                                        .andWhere(`cardholder.access_right = '${guest.access_right}'`)
                                        .getMany()

                                    CardKeyController.editCardKey(location, req_data.company, auth_user.id, access_rule, null, cardholders)
                                }
                                break
                            }
                        }
                    }
                }
            } else {
                for (const guest_access_rule of guest.access_rights.access_rules) {
                    if (access_point_ids.indexOf(guest_access_rule.access_point) === -1) {
                        const acu = guest_access_rule.access_points.acus
                        if (acu.status === acuStatus.ACTIVE) {
                            const schedule: Schedule = await Schedule.findOneOrFail({ id: guest_access_rule.schedule })
                            const send_data = { id: guest_access_rule.id, access_point: guest_access_rule.access_points.id }
                            SdlController.delSdl(location, acu.serial_number, send_data, auth_user, schedule.type, acu.session_id)
                        } else {
                            await AccessRule.destroyItem(guest_access_rule)
                        }
                    }
                }

                for (const access_point_id of access_point_ids) {
                    let add_access_rule = true
                    for (const guest_access_rule of guest.access_rights.access_rules) {
                        if (access_point_id === guest_access_rule.access_point) {
                            add_access_rule = false
                        }
                    }

                    if (add_access_rule) {
                        for (const invite_user_access_rule of invite_user.access_rights.access_rules) {
                            if (access_point_id === invite_user_access_rule.id) {
                                invite_user_access_rule.access_right = guest.access_right
                                if (guest.schedule_type !== scheduleCustomType.DEFAULT && guest.schedule) invite_user_access_rule.schedule = guest.schedule
                                await AccessRule.addItem(invite_user_access_rule)
                            }
                        }
                    }
                }
            }

            const res_data = await Cardholder.updateItem(req_data as Cardholder, auth_user)
            ctx.body = res_data.new

            // const where = { id: cardholder.id }
            // const relations = ['limitations', 'access_rights', 'credentials']
            // ctx.body = await Cardholder.getItem(where, relations)
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
     *  /cardholder/addFromCabinet:
     *      post:
     *          tags:
     *              - Cardholder
     *          summary: Creates a cardholder.
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
     *              name: cardholder
     *              description: The cardholder to create.
     *              schema:
     *                type: object
     *                required:
     *                  - first_name
     *                  - email
     *                properties:
     *                    first_name:
     *                        type: string
     *                        example: some_first_name
     *                    last_name:
     *                        type: string
     *                        example: some_last_name
     *                    email:
     *                        type: string
     *                        example: example@gmail.com
     *                    phone:
     *                        type: string
     *                        example: +374 XX XXX XXX
     *                    status:
     *                        type: string
     *                        enum: [inactive, active, expired, noCredential, pending]
     *                        example: active
     *                    limitations:
     *                        type: object
     *                        properties:
     *                            enable_date:
     *                                type: boolean
     *                                example: true
     *                            valid_from:
     *                                type: string
     *                                example: 2020-04-04 00:00:00
     *                            valid_due:
     *                                type: string
     *                                example: 2020-05-05 15:00:00
     *                            pass_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            pass_counter_passes:
     *                                type: number
     *                                example: 25
     *                            pass_counter_current:
     *                                type: number
     *                                example: 10
     *                            first_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            first_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            first_use_counter_current:
     *                                type: number
     *                                example: 10
     *                            last_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            last_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            last_use_counter_current:
     *                                type: number
     *                                example: 10
     *                    credentials:
     *                        type: array
     *                        items:
     *                            type: object
     *                            properties:
     *                                type:
     *                                    type: string
     *                                    enum: [rfid, pinpass, vikey, phone_bt, phone_nfc, fingerprint, face, face_temperature, car_lp_number]
     *                                    example: rfid
     *                                code:
     *                                    type: string
     *                                    example: 1245644
     *                                status:
     *                                    type: string
     *                                    enum: [active, stolen, lost]
     *                                    example: active
     *                                facility:
     *                                    type: number
     *                                    example: 2
     *                                input_mode:
     *                                    type: string
     *                                    enum: [serial_number, wiegand_26]
     *                                    example: serial_number
     *                                company:
     *                                     type:number
     *                                     example:1
     *                    access_points:
     *                        type: Array<number>
     *                        example: [1]
     *          responses:
     *              '201':
     *                  description: A cardholder object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async addFromCabinet (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            const auth_user = ctx.user
            const location = `${auth_user.company_main}/${auth_user.company}`
            req_data.company = auth_user.company ? auth_user.company : null
            req_data.create_by = auth_user.id

            // const invite_user: Cardholder = await Cardholder.findOneOrFail({
            //     relations: ['access_rights', 'access_rights.access_rules'],
            //     where: { id: auth_user.cardholder }
            // })

            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getMany()
            const check_credentials = await CheckCredentialSettings.checkSettings(req_data.credentials, auth_user.company)
            if (check_credentials !== true) {
                ctx.status = 400
                return ctx.body = { message: check_credentials }
            }

            const check_virt_keys = await CheckCredentialSettings.checkVirtualKeys(req_data.credentials, req_data.company)
            if (check_virt_keys !== true) {
                ctx.status = 403
                return ctx.body = { message: check_virt_keys }
            }

            const check_key_per_user = await CheckCredentialSettings.checkKeyPerUser(req_data.credentials, req_data.company)
            if (check_key_per_user !== true) {
                ctx.status = 403
                return ctx.body = { message: check_key_per_user }
            }

            if (req_data.limitations) {
                const limitation_data = await Limitation.addItem(req_data.limitations as Limitation)
                if (limitation_data) {
                    req_data.limitation = limitation_data.id
                }
            }

            const access_rigth: any = await AccessRight.addItem({ name: req_data.first_name, company: invite_user.company } as AccessRight)
            req_data.access_right = access_rigth.id

            const access_point_ids = req_data.access_points
            if (access_point_ids && access_point_ids.length) {
                for (const access_rule of invite_user.access_rights.access_rules) {
                    if (access_point_ids.indexOf(access_rule.access_point) !== -1) {
                        access_rule.access_right = access_rigth.id
                        await AccessRule.addItem(access_rule)
                    }
                }
            }
            const cardholder: Cardholder = await Cardholder.addItem(req_data as Cardholder)

            const access_points = await AccessPoint.createQueryBuilder('access_point')
                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`acu.company = ${ctx.user.company}`)
                .select('access_point.id')
                .getMany()

            if (access_points.length) {
                // const access_rights = await AccessRight.findOneOrFail({
                //     where: { id: cardholder.access_right },
                //     relations: [
                //         'access_rules',
                //         'access_rules.schedules',
                //         'access_rules.schedules.timeframes',
                //         'access_rules.access_points',
                //         'access_rules.access_points.acus'
                //     ]
                // })

                const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                    .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                    .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                    .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                    .where(`access_right.id = '${cardholder.access_right}'`)
                    .getOne()
                for (const access_rule of access_rights.access_rules) {
                    if (access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                        SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, auth_user, access_rule.access_points.acus.session_id)
                    }
                }
            }

            if (req_data.credentials && req_data.credentials.length) {
                const credentials: any = []
                for (const credential of req_data.credentials) {
                    credential.company = auth_user.company
                    credential.cardholder = cardholder.id
                    const data: any = await Credential.addItem(credential as Credential)
                    credentials.push(data)
                }

                if (access_points.length) {
                    // const access_rights = await AccessRight.findOneOrFail({ where: { id: cardholder.access_right }, relations: ['access_rules'] })

                    const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                        .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                        .where(`access_right.id = '${cardholder.access_right}'`)
                        .getOne()
                    cardholder.access_rights = access_rights
                    cardholder.credentials = credentials

                    CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, req_data.company, auth_user, access_points, [cardholder], null)
                }
            }

            // const where = { id: cardholder.id }
            // const relations = ['limitations', 'access_rights', 'credentials']
            // ctx.body = await Cardholder.getItem(where, relations)

            const cardholders = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.limitations', 'limitation')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                .where(`cardholder.id = '${cardholder.id}'`)
                .getOne()
            ctx.body = cardholders
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /cardholder/updateFromCabinet:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: Update a cardholder from cabinet.
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
     *              name: cardholder
     *              description: The cardholder to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                    id:
     *                        type: number
     *                        example: 1
     *                    first_name:
     *                        type: string
     *                        example: some_first_name
     *                    last_name:
     *                        type: string
     *                        example: some_last_name
     *                    email:
     *                        type: string
     *                        example: example@gmail.com
     *                    phone:
     *                        type: string
     *                        example: +374 XX XXX XXX
     *                    status:
     *                        type: string
     *                        enum: [inactive, active, expired, noCredential, pending]
     *                        example: active
     *                    limitations:
     *                        type: object
     *                        properties:
     *                            id:
     *                                type: number
     *                                example: 1
     *                            enable_date:
     *                                type: boolean
     *                                example: true
     *                            valid_from:
     *                                type: string
     *                                example: 2020-04-04 00:00:00
     *                            valid_due:
     *                                type: string
     *                                example: 2020-05-05 15:00:00
     *                            pass_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            pass_counter_passes:
     *                                type: number
     *                                example: 25
     *                            pass_counter_current:
     *                                type: number
     *                                example: 10
     *                            first_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            first_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            first_use_counter_current:
     *                                type: number
     *                                example: 10
     *                            last_use_counter_enable:
     *                                type: boolean
     *                                example: true
     *                            last_use_counter_days:
     *                                type: number
     *                                example: 25
     *                            last_use_counter_current:
     *                                type: number
     *                                example: 10
     *                    credentials:
     *                        type: array
     *                        items:
     *                            type: object
     *                            properties:
     *                                type:
     *                                    type: string
     *                                    enum: [rfid, pinpass, vikey, phone_bt, phone_nfc, fingerprint, face, face_temperature, car_lp_number]
     *                                    example: rfid
     *                                code:
     *                                    type: string
     *                                    example: 1245644
     *                                status:
     *                                    type: string
     *                                    enum: [active, stolen, lost]
     *                                    example: active
     *                                facility:
     *                                    type: number
     *                                    example: 2
     *                                input_mode:
     *                                    type: string
     *                                    enum: [serial_number, wiegand_26]
     *                                    example: serial_number
     *                                company:
     *                                     type:number
     *                                     example:1
     *                    access_points:
     *                        type: Array<number>
     *                        example: [1]
     *          responses:
     *              '201':
     *                  description: A cardholder object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async updateFromCabinet (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body

            const auth_user = ctx.user
            const company = auth_user.company ? auth_user.company : null
            const location = `${auth_user.company_main}/${company}`

            const check_credentials = await CheckCredentialSettings.checkSettings(req_data.credentials, company)
            if (check_credentials !== true) {
                ctx.status = 400
                return ctx.body = { message: check_credentials }
            }

            const check_virt_keys = await CheckCredentialSettings.checkVirtualKeys(req_data.credentials, req_data.company)
            if (check_virt_keys !== true) {
                ctx.status = 403
                return ctx.body = { message: check_virt_keys }
            }

            const check_key_per_user = await CheckCredentialSettings.checkKeyPerUser(req_data.credentials, req_data.company)
            if (check_key_per_user !== true) {
                ctx.status = 403
                return ctx.body = { message: check_key_per_user }
            }

            // const invite_user: Cardholder = await Cardholder.findOneOrFail({
            //     relations: ['access_rights', 'access_rights.access_rules'],
            //     where: { id: auth_user.cardholder }
            // })
            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getOne()
            // const created_cardholder: Cardholder = await Cardholder.findOneOrFail({
            //     relations: [
            //         'access_rights',
            //         'access_rights.access_rules',
            //         'access_rights.access_rules.access_points',
            //         'access_rights.access_rules.access_points.acus'
            //     ],
            //     where: { id: req_data.id, company: company }
            // })

            const created_cardholder: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`cardholder.id = '${req_data.id}'`)
                .andWhere(`cardholder.company = '${company}'`)
                .getOne()
            if (req_data.limitations) {
                await Limitation.updateItem(req_data.limitations as Limitation)
            }

            const access_point_ids = req_data.access_points
            for (const created_cardholder_access_rule of created_cardholder.access_rights.access_rules) {
                if (access_point_ids.indexOf(created_cardholder_access_rule.access_point) === -1) {
                    const acu = created_cardholder_access_rule.access_points.acus
                    if (acu.status === acuStatus.ACTIVE) {
                        const schedule: Schedule = await Schedule.findOneOrFail({ id: created_cardholder_access_rule.schedule })
                        const send_data = { id: created_cardholder_access_rule.id, access_point: created_cardholder_access_rule.access_points.id }
                        SdlController.delSdl(location, acu.serial_number, send_data, auth_user, schedule.type, acu.session_id)
                    } else {
                        await AccessRule.destroyItem(created_cardholder_access_rule)
                    }
                }
            }

            for (const access_point_id of access_point_ids) {
                let add_access_rule = true
                for (const created_cardholder_access_rule of created_cardholder.access_rights.access_rules) {
                    if (access_point_id === created_cardholder_access_rule.access_point) {
                        add_access_rule = false
                    }
                }

                if (add_access_rule) {
                    for (const invite_user_access_rule of invite_user.access_rights.access_rules) {
                        if (access_point_id === invite_user_access_rule.id) {
                            invite_user_access_rule.access_right = created_cardholder.access_right
                            if (created_cardholder.schedule_type !== scheduleCustomType.DEFAULT && created_cardholder.schedule) {
                                invite_user_access_rule.schedule = created_cardholder.schedule
                            }
                            await AccessRule.addItem(invite_user_access_rule)
                        }
                    }
                }
            }
            const res_data = await Cardholder.updateItem(req_data as Cardholder, auth_user)
            ctx.body = res_data.new

            const access_points = await AccessPoint.createQueryBuilder('access_point')
                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                .andWhere(`acu.company = ${ctx.user.company}`)
                .select('access_point.id')
                .getMany()

            if (access_points.length) {
                // const access_rights = await AccessRight.findOneOrFail({
                //     where: { id: created_cardholder.access_right },
                //     relations: [
                //         'access_rules',
                //         'access_rules.schedules',
                //         'access_rules.schedules.timeframes',
                //         'access_rules.access_points',
                //         'access_rules.access_points.acus'
                //     ]
                // })

                const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .leftJoinAndSelect('access_rule.schedules', 'schedule', 'schedule.delete_date is null')
                    .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                    .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                    .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                    .where(`access_right.id = '${created_cardholder.access_right}'`)
                    .getOne()
                for (const access_rule of access_rights.access_rules) {
                    if (access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                        SdlController.setSdl(location, access_rule.access_points.acus.serial_number, access_rule, auth_user, access_rule.access_points.acus.session_id)
                    }
                }
            }

            if (req_data.credentials && req_data.credentials.length) {
                const credentials: any = []
                const old_credentials: any = []
                for (const credential of req_data.credentials) {
                    if (!credential.id) {
                        credential.company = auth_user.company
                        credential.cardholder = req_data.id
                        const data: any = await Credential.addItem(credential as Credential)
                        credentials.push(data)
                    } else {
                        old_credentials.push(credential)
                    }
                }

                if (access_points.length) {
                    // const access_rights = await AccessRight.findOne({ where: { id: created_cardholder.access_right }, relations: ['access_rules'] })

                    const access_rights: any = await AccessRight.createQueryBuilder('access_right')
                        .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                        .where(`access_right.id = '${created_cardholder.access_right}'`)
                        .getOne()
                    if (access_rights) {
                        created_cardholder.access_rights = access_rights
                        created_cardholder.credentials = credentials

                        CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, req_data.company, auth_user, access_points, [created_cardholder], null)
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
     *  /cardholder/deActivate:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: Activate or deactivate cardholder.
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
     *              name: cardholder
     *              description: Change status of Cardholder.
     *              schema:
     *                type: object
     *                required:
     *                  - ids
     *                  - status
     *                properties:
     *                  ids:
     *                      type: Array<number>
     *                      example: [1]
     *                  status:
     *                      type: string
     *                      enum: [active, inactive]
     *                      example: active
     *          responses:
     *              '201':
     *                  description: Change status of Cardholder
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async deActivate (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const auth_user = ctx.user
            const company = auth_user.company ? auth_user.company : null

            const location = `${auth_user.company_main}/${auth_user.company}`
            if (req_data.status === cardholderStatus.INACTIVE || req_data.status === cardholderStatus.ACTIVE) {
                const cardholders = await Cardholder.getAllItems({ where: { id: { in: req_data.ids }, company: { '=': company } }, relations: ['credentials'] })
                const save: any = []
                // const access_points = await AccessPoint.createQueryBuilder('access_point')
                //     .innerJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                //     .where(`acu.status = '${acuStatus.ACTIVE}'`)
                //     .andWhere(`acu.company = ${ctx.user.company}`)
                //     .getMany()

                for (const cardholder of cardholders) {
                    if (cardholder.status !== req_data.status) {
                        cardholder.status = req_data.status
                        save.push(Cardholder.save(cardholder))
                    }

                    for (const credential of cardholder.credentials) {
                        if (req_data.status === cardholderStatus.ACTIVE) {
                            credential.status = credentialStatus.ACTIVE
                        } else {
                            credential.status = credentialStatus.LOST
                        }
                        save.push(Credential.save(credential))
                    }

                    // CardKeyController.editCardKey(location, company, auth_user.id, null, access_points, [cardholder])
                }
                await Promise.all(save)
                CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, auth_user, null)
                ctx.body = { success: true }
            } else {
                ctx.body = {
                    message: `Invalid status ${req_data.status}`
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
     *  /cardholder/moveToGroup:
     *      put:
     *          tags:
     *              - Cardholder
     *          summary: cardholders move to group.
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
     *              name: cardholder
     *              description: Change status of Cardholder.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                  - status
     *                properties:
     *                  cardholder_group:
     *                      type: number
     *                      example: 1
     *                  ids:
     *                      type: Array<number>
     *                      example: [1]
     *          responses:
     *              '201':
     *                  description: Change status of Cardholder
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async moveToGroup (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const auth_user = ctx.user
            const company = auth_user.company ? auth_user.company : null
            const where = { id: req_data.cardholder_group, company: company }
            const check_by_company = await CardholderGroup.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const cardholders = await Cardholder.getAllItems({ where: { id: { in: req_data.ids }, company: { '=': company } } })

                const save = []
                for (const cardholder of cardholders) {
                    if (cardholder.cardholder_group !== req_data.cardholder_group) {
                        cardholder.cardholder_group = req_data.cardholder_group
                        save.push(Cardholder.updateItem(cardholder, auth_user))
                    }
                }
                Promise.all(save)
                ctx.body = { success: true }
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
     *  /cardholder/groupDelete:
     *      delete:
     *          tags:
     *              - Cardholder
     *          summary: delete cardholders.
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
     *              name: cardholder
     *              description: Change status of Cardholder.
     *              schema:
     *                type: object
     *                required:
     *                  - ids
     *                  - status
     *                properties:
     *                  ids:
     *                      type: Array<number>
     *                      example: [1]
     *          responses:
     *              '201':
     *                  description: Change status of Cardholder
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async groupDelete (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const auth_user = ctx.user
            const company = auth_user.company ? auth_user.company : null

            const cardholders = await Cardholder.getAllItems({ where: { id: { in: req_data.ids }, company: { '=': company } } })
            const save = []
            for (const cardholder of cardholders) {
                if (cardholder.status !== req_data.status) {
                    cardholder.status = req_data.status
                    save.push(Cardholder.destroyItem(cardholder))
                }
            }
            Promise.all(save)
            ctx.body = { success: true }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
