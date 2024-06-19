import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
import { Limitation } from '../model/entity/Limitation'
import { Cardholder } from '../model/entity/Cardholder'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { Credential } from '../model/entity/Credential'
import { acuStatus } from '../enums/acuStatus.enum'
import { AccessPoint, AccessRight, AccessRule, Admin, Company, Role, Schedule } from '../model/entity'
import { OperatorType } from '../mqtt/Operators'
import { CheckCredentialSettings } from '../functions/check-credential'
import { Sendgrid } from '../../component/sendgrid/sendgrid'
import { uid } from 'uid'
import { validate } from '../functions/passValidator'
import { guestKeyType } from '../enums/guestKeyType.enum'
import { Timeframe } from '../model/entity/Timeframe'
import SdlController from './Hardware/SdlController'
import CardKeyController from './Hardware/CardKeyController'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { cardholderStatus } from '../enums/cardholderStatus.enum'
import { credentialStatus } from '../enums/credentialStatus.enum'
import { locationGenerator } from '../functions/locationGenerator'
import { CheckGuest } from '../functions/check-guest'
import { guestPeriod } from '../enums/guestPeriod.enum'
import moment from 'moment'
import CtpController from './Hardware/CtpController'
import { credentialType } from '../enums/credentialType.enum'
import { cloneDeep } from 'lodash'
import { Brackets } from 'typeorm'
import CronJob from '../cron'
import { guestGetDatesFromTimestamps } from '../functions/guest_get_dates_from_timestamps'
import { minusResource } from '../functions/minusResource'
import { adminStatus } from '../enums/adminStatus.enum'
import { JwtToken } from '../model/entity/JwtToken'
const xlsxj = require('xlsx-to-json')
var chunk = require('chunk')

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
     *                        type: string
     *                        enum: [inactive, active, expired, noCredential, pending]
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
     *                                access_point:
     *                                     type:number
     *                                     example:1
     *                                mode:
     *                                    type: string
     *                                    enum: [automatic,manual]
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
            const location = await locationGenerator(auth_user)
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
                    if (cardholder.status === cardholderStatus.ACTIVE) {
                        credential.status = credentialStatus.ACTIVE
                    } else if (cardholder.status === cardholderStatus.INACTIVE) {
                        credential.status = credentialStatus.INACTIVE
                    }
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
     *                        type: string
     *                        enum: [inactive, active, expired, noCredential, pending]
     *                        example: active
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
     *                                  type: string
     *                                  enum: [rfid, pinpass, vikey, phone_bt, phone_nfc, fingerprint, face, face_temperature, car_lp_number]
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
     *                                  type: string
     *                                  enum: [serial_number, wiegand_26]
     *                                  example: serial_number
     *                              company:
     *                                   type:number
     *                                   example:1
     *                              access_point:
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
            const check_by_company = await Cardholder.findOne({ where, relations: ['limitations'] })

            const logs_data = []

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const check_credentials = await CheckCredentialSettings.checkSettings(req_data.credentials, company)
                const location = await locationGenerator(auth_user)

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

                const cardholder_account = await Admin.findOne({ where: { cardholder: cardholder.id } })
                let send_card_key_for_change_guest_status = false
                if (cardholder_account) {
                    if (check_by_company.status !== cardholder.status) {
                        if (cardholder.status === cardholderStatus.INACTIVE) {
                            if (cardholder_account.status !== adminStatus.INACTIVE) {
                                await Admin.updateItem({ id: cardholder_account.id, status: adminStatus.INACTIVE })
                                const tokens = await JwtToken.find({ where: { account: cardholder_account.id } })
                                for (const token of tokens) {
                                    token.expired = true
                                    await token.save({ transaction: false })
                                }
                            }
                            const guests = await Cardholder.find({ where: { create_by: cardholder_account.id } })
                            for (const guest of guests) {
                                guest.status = cardholderStatus.INACTIVE
                                await guest.save({ transaction: false })
                                const guest_keys = await Credential.find({ where: { cardholder: guest.id } })
                                for (const guest_key of guest_keys) {
                                    if (guest_key.status !== credentialStatus.INACTIVE) {
                                        send_card_key_for_change_guest_status = true
                                        guest_key.status = credentialStatus.INACTIVE
                                        await guest_key.save({ transaction: false })
                                    }
                                }
                            }
                        } else if (cardholder.status === cardholderStatus.ACTIVE) {
                            const guests = await Cardholder.find({ where: { create_by: cardholder_account.id } })
                            for (const guest of guests) {
                                guest.status = cardholderStatus.ACTIVE
                                await guest.save({ transaction: false })
                                const guest_keys = await Credential.find({ where: { cardholder: guest.id } })
                                for (const guest_key of guest_keys) {
                                    if (guest_key.status !== credentialStatus.ACTIVE) {
                                        send_card_key_for_change_guest_status = true
                                        guest_key.status = credentialStatus.ACTIVE
                                        await guest_key.save({ transaction: false })
                                    }
                                }
                            }
                        }
                    }
                }

                const credentials: any = []
                const old_credentials: any = []
                const updated_credentials: any = []
                if (req_data.credentials && req_data.credentials.length) {
                    // const keys_count = calculateCredentialsKeysCountToSendDevice(req_data)

                    for (let credential of req_data.credentials) {
                        if (!credential.id) {
                            credential.company = auth_user.company
                            credential.cardholder = req_data.id
                            if (cardholder.status === cardholderStatus.ACTIVE) {
                                credential.status = credentialStatus.ACTIVE
                            } else {
                                credential.status = credentialStatus.INACTIVE
                            }
                            const credential_data: any = await Credential.addItem(credential as Credential)
                            logs_data.push({
                                event: logUserEvents.CREATE,
                                target: `${Credential.name}/${cardholder.first_name}/${credential_data.type}`,
                                value: credential_data
                            })
                            credentials.push(credential_data)
                        } else {
                            if (cardholder.status === cardholderStatus.ACTIVE && credential.status === credentialStatus.INACTIVE) {
                                credential.status = credentialStatus.ACTIVE
                                credential = await Credential.updateItem(credential)
                                updated_credentials.push(credential)
                            } else if (cardholder.status === cardholderStatus.INACTIVE && credential.status === credentialStatus.ACTIVE) {
                                credential.status = credentialStatus.INACTIVE
                                credential = await Credential.updateItem(credential)
                                updated_credentials.push(credential)
                            }
                            old_credentials.push(credential)
                        }
                    }

                    const limitations = await Limitation.findOne({ where: { id: cardholder.limitation } })
                    cardholder.limitations = limitations

                    if (
                        check_by_company.access_right !== cardholder.access_right ||
                        send_card_key_for_change_guest_status ||
                        (check_by_company.limitations && limitations &&
                            (
                                JSON.stringify(check_by_company.limitations.valid_from) !== JSON.stringify(limitations.valid_from) ||
                                JSON.stringify(check_by_company.limitations.valid_due) !== JSON.stringify(limitations.valid_due) ||
                                check_by_company.limitations.pass_counter_enable !== limitations.pass_counter_enable ||
                                check_by_company.limitations.pass_counter_passes !== limitations.pass_counter_passes ||
                                check_by_company.limitations.first_use_counter_enable !== limitations.first_use_counter_enable ||
                                check_by_company.limitations.first_use_counter_days !== limitations.first_use_counter_days ||
                                check_by_company.limitations.last_use_counter_enable !== limitations.last_use_counter_enable ||
                                check_by_company.limitations.last_use_counter_days !== limitations.last_use_counter_days
                            )
                        )
                    ) {
                        CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, auth_user.company, auth_user, null)
                    } else {
                        if (credentials.length || old_credentials.length) {
                            const access_points: AccessPoint[] = await AccessPoint.createQueryBuilder('access_point')
                                .innerJoin('access_point.acus', 'acu', 'acu.delete_date is null')
                                .where(`acu.status = '${acuStatus.ACTIVE}'`)
                                .andWhere(`acu.company = ${ctx.user.company}`)
                                .select('access_point.id')
                                .addSelect('access_point.acu')
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

                                    if (updated_credentials.length) {
                                        cardholder.credentials = updated_credentials
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
          //  console.log('error', error)

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
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
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
            const location = await locationGenerator(user)
            const where = { id: req_data.id, company: user.company ? user.company : null }
            // const cardholder = await Cardholder.findOneOrFail({ where: where })

            const cardholder = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null and credential.code is not null')
                .where(`cardholder.id = '${req_data.id}'`)
                .andWhere(`cardholder.company = '${user.company}'`)
                .getOne()
            if (!cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Cardholder not found' }
            }

            ctx.body = await Cardholder.destroyItem(where)

            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Cardholder.name}/${cardholder.first_name}`,
                value: { name: cardholder.first_name }
            }]
            CardKeyController.dellKeys(location, user.company, cardholder, user)
        } catch (error) {

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
     *              - in: query
     *                name: search
     *                description: search term
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
            const req_data = ctx.query
            const user = ctx.user
            let resource_limit
            let resource_limited = false
            if (ctx.query.packageExtraSettings) {
                if (ctx.query.packageExtraSettings.resources.Cardholder) {
                    resource_limit = ctx.query.packageExtraSettings.resources.Cardholder
                } else {
                    resource_limit = 0
                }
                resource_limited = true
            }

            // req_data.relations = ['car_infos', 'limitations', 'antipass_backs', 'time_attendances', 'access_rights', 'cardholder_groups', 'credentials']

            let cardholders: any
            if (user.cardholder) {
                // where.guest = { '=': false }
                // where.create_by = { '=': user.id }
                // req_data.relations = ['limitations', 'access_rights', 'credentials']
                cardholders = Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.company = '${user.company ? user.company : null}'`)
                    .andWhere(`cardholder.guest = ${false}`)
                    .andWhere(`cardholder.create_by = '${user.id}'`)
            } else {
                cardholders = Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    // .leftJoinAndSelect('cardholder.antipass_backs', 'antipass_back')
                    .leftJoinAndSelect('cardholder.time_attendances', 'schedule')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.company = '${user.company ? user.company : null}'`)
            }
            if (req_data.search) {
                cardholders.andWhere(new Brackets(qb => {
                    qb.where('cardholder.first_name LIKE :search', { search: `%${req_data.search}%` })
                        .orWhere('cardholder.last_name LIKE :search', { search: `%${req_data.search}%` })
                        .orWhere("CONCAT(cardholder.first_name, ' ', cardholder.last_name) LIKE :search", { search: `%${req_data.search}%` })
                }))
            }

            let take = req_data.page ? req_data.page_items_count ? (req_data.page_items_count > 10000) ? 10000 : req_data.page_items_count : 25 : 100
            const skip = req_data.page_items_count && req_data.page ? (req_data.page - 1) * req_data.page_items_count : 0
            if (resource_limited) {
                if (req_data.page) {
                    if (req_data.page * take > resource_limit) {
                        take = resource_limit - (req_data.page - 1) * take
                        if (take < 0) take = 0
                    }
                } else {
                    if (take > resource_limit) take = resource_limit
                }
            }
            let [result, total] = await cardholders
                .take(take)
                .skip(skip)
                .orderBy('cardholder.id', 'DESC')
                .getManyAndCount()

            if (resource_limited && total > resource_limit) {
                total = resource_limit
            }
            if (req_data.page) {
                ctx.body = {
                    data: result,
                    count: total
                }
            } else {
                ctx.body = result
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
     *                                type: string
     *                                enum: [inactive, active, expired, noCredential, pending]
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
                    await cardholder.save({ transaction: false })
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
            const cardholder: any = await Cardholder.findOne({ where: { email: reqData.email } })
            if (!cardholder) {
                ctx.status = 400
                ctx.body = { message: 'Invalid Cardholder email' }
            }
            const check_admin: any = await Admin.findOne({ where: { email: reqData.email } })
            if (check_admin) {
                ctx.status = 400
                ctx.body = { message: `email ${reqData.email} already exists` }
            }
            reqData.company = company
            reqData.verify_token = uid(32)
            reqData.cardholder = cardholder.id

            // const role_slug = 'default_cardholder'
            // let default_cardholder_role = await Role.findOne({ where: {lug: role_slug, company: company })
            // console.log('default_cardholder_role', default_cardholder_role)

            // if (!default_cardholder_role) {
            const permissions: string = JSON.stringify(Role.default_cardholder_role)
            // permissions = default_cardholder_role.permissions
            const role_save_data = {
                // slug: role_slug,
                slug: 'default_cardholder',
                company: cardholder.company,
                permissions: permissions,
                cardholder: true
            }
            const default_cardholder_role = await Role.addItem(role_save_data as Role)
            // }

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
        const user = await Admin.findOne({ where: { verify_token: verify_token } })
        if (user) {
            const password = ctx.request.body.password
            if (validate(password).success) {
                user.password = password
                user.verify_token = null
                await user.save({ transaction: false })
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
     *                    access_points:
     *                        type: Array<number>
     *                        example: [1]
     *                    key_type:
     *                        type: string
     *                        enum: [temporary, permanent]
     *                        example: temporary
     *                    period:
     *                        type: string
     *                        enum: [hours, days]
     *                        example: hours
     *                    duration:
     *                        type: number
     *                        example: 30
     *                    start_date:
     *                        type: string
     *                        example: '2022-02-05 14:14:14'
     *                    end_date:
     *                        type: string
     *                        example: '2022-02-05 15:15:15'
     *                    days_of_week:
     *                        type: Array<number>
     *                        example: [1,5,6]
     *                    start_time:
     *                        type: string
     *                        example: '15:00:00'
     *                    end_time:
     *                        type: string
     *                        example: '16:00:00'
     *                    selected_access_point:
     *                        type: number
     *                        example: 55
     *                    set_key:
     *                        type: boolean
     *                        example: false
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
            const location = await locationGenerator(auth_user)
            req_data.company = auth_user.company ? auth_user.company : null
            req_data.create_by = auth_user.id
            req_data.guest = true

            if (!auth_user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can create Guest' }
            }

            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getOne()

            if (invite_user.status === cardholderStatus.INACTIVE) {
                ctx.status = 400
                return ctx.body = { message: `Your status is ${cardholderStatus.INACTIVE}` }
            }

            const created_guests = await Cardholder.find({ where: { create_by: auth_user.id, guest: true } })

            if (!invite_user.enable_create_guest) {
                ctx.status = 400
                return ctx.body = { message: 'You have not permission to create Guest' }
            }
            if (created_guests.length >= invite_user.guest_count) {
                ctx.status = 400
                return ctx.body = { message: 'Guest limit has reached' }
            }

            const company: any = await Company.createQueryBuilder('company')
                .leftJoinAndSelect('company.base_schedules', 'base_schedule')
                .leftJoinAndSelect('base_schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`company.id = '${req_data.company}'`)
                .getOne()

            const check_guest = await CheckGuest.checkSaveGuest(req_data, company, invite_user)
            if (check_guest !== true) {
                ctx.status = 400
                return ctx.body = { message: check_guest }
            }

            let pinpass_code
            if (req_data.key_type === guestKeyType.TEMPORARY) {
                pinpass_code = await CheckGuest.tryGeneratePinpassCode(req_data.company)
            }

            const selected_access_point: any = await AccessPoint.findOne({ where: { id: req_data.selected_access_point, company: req_data.company }, relations: ['acus'] })
            if (req_data.set_key) {
                if (!selected_access_point) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid selected AccessPoint for set Key' }
                } else if (selected_access_point.acus.status !== acuStatus.ACTIVE) {
                    ctx.status = 400
                    return ctx.body = { message: `status Acu of selected AccessPoint is not ${acuStatus.ACTIVE}` }
                }
            }

            const access_right: any = await AccessRight.addItem({
                name: req_data.first_name,
                custom: true,
                company: invite_user.company
            } as AccessRight)
            req_data.access_right = access_right.id

            let schedule: any
            const timeframes = []

            guestGetDatesFromTimestamps(req_data)
            if (req_data.key_type === guestKeyType.TEMPORARY) {
                const start_date = `${moment(req_data.start_date).format('YYYY-MM-DD')} ${req_data.start_time}`
                let end_date = `${moment(req_data.end_date).format('YYYY-MM-DD')} ${req_data.end_time}`
                if (req_data.period === guestPeriod.HOURS) {
                    const end_date_timestamp = new Date(start_date).getTime() + req_data.duration * 60 * 1000
                    end_date = moment(end_date_timestamp).format('YYYY-MM-DD HH:mm:ss')
                }
                schedule = await Schedule.addItem({
                    ...company.base_schedules,
                    name: req_data.first_name,
                    custom: true,
                    company: invite_user.company,
                    start_date: start_date,
                    end_date: end_date
                } as Schedule)
                for (const timeframe of company.base_schedules.timeframes) {
                    timeframe.schedule = schedule.id
                    timeframe.company = invite_user.company
                    timeframes.push(await Timeframe.addItem(timeframe))
                }
            } else if (req_data.key_type === guestKeyType.PERMANENT) {
                schedule = await Schedule.addItem({
                    ...company.base_schedules,
                    name: req_data.first_name,
                    custom: true,
                    company: invite_user.company
                } as Schedule)
                for (const day_of_week of req_data.days_of_week) {
                    const timeframe = {
                        schedule: schedule.id,
                        name: day_of_week,
                        start: req_data.start_time,
                        end: req_data.end_time,
                        company: invite_user.company
                    } as Timeframe
                    timeframes.push(await Timeframe.addItem(timeframe))
                }
            }

            access_right.access_rules = []
            const access_point_ids = req_data.access_points
            if (access_point_ids && access_point_ids.length) {
                for (const access_point_id of access_point_ids) {
                    const access_rule = await AccessRule.addItem({
                        access_right: access_right.id,
                        access_point: access_point_id,
                        schedule: schedule.id,
                        company: invite_user.company
                    } as AccessRule)

                    for (const parent_access_rule of invite_user.access_rights.access_rules) {
                        if (parent_access_rule.access_point === access_point_id) {
                            access_rule.access_points = parent_access_rule.access_points
                            access_rule.schedules = schedule
                            access_rule.schedules.timeframes = timeframes
                            if (parent_access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                                // we need send setSdl....
                                SdlController.setSdl(location, parent_access_rule.access_points.acus.serial_number, access_rule, auth_user, parent_access_rule.access_points.acus.session_id)
                            }
                            access_right.access_rules.push(access_rule)
                        }
                    }
                }
            }

            req_data.time_attendance = schedule.id
            const guest: Cardholder = await Cardholder.addItem(req_data as Cardholder)

            guest.access_rights = access_right
            if (req_data.key_type === guestKeyType.TEMPORARY) {
                const credential: any = await Credential.addItem({
                    type: credentialType.PINPASS,
                    company: req_data.company,
                    cardholder: guest.id,
                    code: pinpass_code
                } as Credential)
                guest.credentials = [credential]
                CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, req_data.company, auth_user, null, [guest], null)
            }

            if (req_data.set_key) {
                const send_data = {
                    access_point_id: selected_access_point.id,
                    cardholder: guest
                }
                CtpController.activateCredential(location, selected_access_point.acus.serial_number, send_data, auth_user, selected_access_point.acus.session_id)
            }

            CronJob.setGuestKeySchedule(guest)
            ctx.body = guest
        } catch (error) {
            ctx.status = error.status || 400
            if (error.message) {
                ctx.body = { message: error.message }
            } else {
                ctx.body = error
            }
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
     *                    id:
     *                        type: number
     *                        example: 1
     *                    first_name:
     *                        type: string
     *                        example: some_first_name
     *                    status:
     *                        type: string
     *                        enum: [inactive, active, expired, noCredential, pending]
     *                        example: active
     *                    access_points:
     *                        type: Array<number>
     *                        example: [1]
     *                    key_type:
     *                        type: string
     *                        enum: [temporary, permanent]
     *                        example: temporary
     *                    period:
     *                        type: string
     *                        enum: [hours, days]
     *                        example: hours
     *                    duration:
     *                        type: number
     *                        example: 30
     *                    start_date:
     *                        type: string
     *                        example: '2022-02-05 14:14:14'
     *                    end_date:
     *                        type: string
     *                        example: '2022-02-05 15:15:15'
     *                    days_of_week:
     *                        type: Array<number>
     *                        example: [1,5,6]
     *                    start_time:
     *                        type: string
     *                        example: '15:00:00'
     *                    end_time:
     *                        type: string
     *                        example: '16:00:00'
     *                    selected_access_point:
     *                        type: number
     *                        example: 55
     *                    set_key:
     *                        type: boolean
     *                        example: false
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
            const company_id = auth_user.company ? auth_user.company : null
            const location = `${auth_user.company_main}/${company_id}`

            if (!auth_user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can update Guest' }
            }

            const guest: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .leftJoinAndSelect('cardholder.time_attendances', 'time_attendance', 'time_attendance.delete_date is null')
                .leftJoinAndSelect('time_attendance.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`cardholder.id = '${req_data.id}'`)
                .andWhere(`cardholder.create_by = '${auth_user.id}'`)
                .getOne()
            if (!guest) {
                ctx.status = 400
                return ctx.body = { message: 'Invalid guest id' }
            }

            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .leftJoinAndSelect('cardholder.time_attendances', 'time_attendance', 'time_attendance.delete_date is null')
                .leftJoinAndSelect('time_attendance.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getOne()

            if (invite_user.status === cardholderStatus.INACTIVE) {
                ctx.status = 400
                return ctx.body = { message: `Your status is ${cardholderStatus.INACTIVE}` }
            }

            const company: any = await Company.createQueryBuilder('company')
                .leftJoinAndSelect('company.base_schedules', 'base_schedule')
                .leftJoinAndSelect('base_schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`company.id = '${company_id}'`)
                .getOne()

            const check_guest = await CheckGuest.checkSaveGuest(req_data, company, invite_user)
            if (check_guest !== true) {
                ctx.status = 400
                return ctx.body = { message: check_guest }
            }

            if (req_data.key_type && req_data.key_type !== guest.key_type) {
                ctx.status = 400
                return ctx.body = { message: 'cant change key_type' }
            }

            const selected_access_point: any = await AccessPoint.findOne({ where: { id: req_data.selected_access_point, company: company_id }, relations: ['acus'] })
            if (req_data.set_key) {
                if (!selected_access_point) {
                    ctx.status = 400
                    return ctx.body = { message: 'Invalid selected AccessPoint for set Key' }
                } else if (selected_access_point.acus.status !== acuStatus.ACTIVE) {
                    ctx.status = 400
                    return ctx.body = { message: `status Acu of selected AccessPoint is not ${acuStatus.ACTIVE}` }
                }
            }

            guestGetDatesFromTimestamps(req_data)
            const guest_update = (await Cardholder.updateItem(req_data as Cardholder, auth_user)).new

            let schedule = cloneDeep(guest.time_attendances)
            let timeframes = cloneDeep(guest.time_attendances.timeframes)
            let time_changed = false

            if (req_data.key_type === guestKeyType.TEMPORARY) {
                const start_date = `${moment(req_data.start_date).format('YYYY-MM-DD')} ${req_data.start_time}`
                let end_date = `${moment(req_data.end_date).format('YYYY-MM-DD')} ${req_data.end_time}`
                if (req_data.period === guestPeriod.HOURS) {
                    const end_date_timestamp = new Date(start_date).getTime() + req_data.duration * 60 * 1000
                    end_date = moment(end_date_timestamp).format('YYYY-MM-DD HH:mm:ss')
                }

                // if (req_data.start_date !== guest.start_date || end_date !== guest.end_date) {
                time_changed = true
                const save_schedule = await Schedule.updateItem({
                    ...schedule,
                    start_date: start_date,
                    end_date: end_date
                } as Schedule)
                schedule = save_schedule.new

                for (const timeframe of timeframes) {
                    await Timeframe.destroyItem({ id: timeframe.id, company: timeframe.company })
                }
                timeframes = []
                for (const timeframe of company.base_schedules.timeframes) {
                    timeframe.schedule = schedule.id
                    timeframe.company = invite_user.company
                    timeframes.push(await Timeframe.addItem(timeframe))
                }
                // }
            } else if (req_data.key_type === guestKeyType.PERMANENT) {
                if (JSON.stringify(req_data.days_of_week) !== guest.days_of_week ||
                    req_data.start_time !== guest.start_time ||
                    req_data.end_time !== guest.end_time
                ) {
                    time_changed = true
                    for (const timeframe of timeframes) {
                        await Timeframe.destroyItem({ id: timeframe.id, company: timeframe.company })
                    }
                    timeframes = []
                    for (const day_of_week of req_data.days_of_week) {
                        const timeframe = {
                            schedule: schedule.id,
                            name: day_of_week,
                            start: req_data.start_time,
                            end: req_data.end_time,
                            company: invite_user.company
                        } as Timeframe
                        timeframes.push(await Timeframe.addItem(timeframe))
                    }
                }
            }

            const access_point_ids = req_data.access_points ? req_data.access_points : []
            const fixed_access_rules = []
            const new_access_point_ids = [...access_point_ids]
            const delete_access_rules = []
            const finally_access_rules = []
            for (const access_rule of guest.access_rights.access_rules) {
                access_rule.schedules = schedule
                access_rule.schedules.timeframes = timeframes
                if (access_point_ids.includes(access_rule.access_point)) {
                    fixed_access_rules.push(access_rule)
                    finally_access_rules.push(access_rule)
                    var ind = new_access_point_ids.indexOf(access_rule.access_point)
                    if (ind !== -1) {
                        new_access_point_ids.splice(ind, 1)
                    }
                } else {
                    delete_access_rules.push(access_rule)
                }
            }

            if (time_changed) {
                for (const fixed_access_rule of fixed_access_rules) {
                    if (fixed_access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                        SdlController.setSdl(location, fixed_access_rule.access_points.acus.serial_number, fixed_access_rule, auth_user, fixed_access_rule.access_points.acus.session_id, true)
                    }
                }
            }

            if (new_access_point_ids.length) {
                for (const new_access_point_id of new_access_point_ids) {
                    const access_rule = await AccessRule.addItem({
                        access_right: guest.access_right,
                        access_point: new_access_point_id,
                        schedule: schedule.id,
                        company: invite_user.company
                    } as AccessRule)
                    access_rule.schedules = schedule
                    access_rule.schedules.timeframes = timeframes
                    finally_access_rules.push(access_rule)
                    const access_point = await AccessPoint.findOne({ where: { id: new_access_point_id }, relations: ['acus'] })
                    if (access_point && access_point.acus.status === acuStatus.ACTIVE) {
                        SdlController.setSdl(location, access_point.acus.serial_number, access_rule, auth_user, access_point.acus.session_id)
                    }
                }
            }

            if (delete_access_rules.length) {
                for (const delete_access_rule of delete_access_rules) {
                    if (delete_access_rule.access_points.acus.status === acuStatus.ACTIVE) {
                        const send_data = { id: delete_access_rule.id, access_point: delete_access_rule.access_point }
                        SdlController.delSdl(location, delete_access_rule.access_points.acus.serial_number, send_data, auth_user, schedule.type, delete_access_rule.access_points.acus.session_id)
                    }
                }
            }

            if (time_changed || new_access_point_ids.length || delete_access_rules.length) {
                CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, auth_user.company, auth_user, null)
            }

            guest_update.access_rights = guest.access_rights
            guest_update.access_rights.access_rules = finally_access_rules
            if (req_data.set_key) {
                const send_data = {
                    access_point_id: selected_access_point.id,
                    cardholder: guest_update
                }
                CtpController.activateCredential(location, selected_access_point.acus.serial_number, send_data, auth_user, selected_access_point.acus.session_id)
            }

            CronJob.setGuestKeySchedule(guest_update)
            ctx.body = guest_update
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
     *      delete:
     *          tags:
     *              - Cardholder
     *          summary: Delete a guest.
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
    public static async destroyGuest (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const company = user.company ? user.company : null
            if (!user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can delete Guest' }
            }
            const location = `${user.company_main}/${company}`
            const where = { id: req_data.id, company: company }
            // const cardholder = await Cardholder.findOne({
            //     where: {
            //         id: req_data.id,
            //         create_by: user.id
            //     }
            // })

            const cardholder = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null and credential.code is not null')
                .where(`cardholder.id = '${req_data.id}'`)
                .andWhere(`cardholder.create_by = '${user.id}'`)
                .getOne()

            if (!cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Invalid Guest id' }
            }

            ctx.body = await Cardholder.destroyItem(where)
            CronJob.unSetGuestKeySchedule(cardholder)

            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Cardholder.name}/${cardholder.first_name}`,
                value: { name: cardholder.first_name }
            }]
            CardKeyController.dellKeys(location, user.company, cardholder, user)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /cardholder/guestsLimit:
     *      get:
     *          tags:
     *              - Cardholder
     *          summary: Return limit for guest add
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
    public static async guestsLimit (ctx: DefaultContext) {
        try {
            const auth_user = ctx.user

            if (!auth_user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can see Guests limit' }
            }

            const invite_user: any = await Cardholder.createQueryBuilder('cardholder')
                .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                .leftJoinAndSelect('access_rule.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoinAndSelect('access_point.acus', 'acu', 'acu.delete_date is null')
                .where(`cardholder.id = '${auth_user.cardholder}'`)
                .getOne()

            const created_guests = await Cardholder.find({ where: { create_by: auth_user.id, guest: true } })

            ctx.body = {
                enable_create_guest: invite_user.enable_create_guest,
                guest_count: invite_user.guest_count,
                created_guests_count: created_guests.length
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
     * /cardholder/guestsTimeKeys:
     *      get:
     *          tags:
     *              - Cardholder
     *          summary: Return time keys
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Time keys
     *              '401':
     *                  description: Unauthorized
     */
    public static async guestsTimeKeys (ctx: DefaultContext) {
        try {
            const auth_user = ctx.user
            if (!auth_user.cardholder) {
                ctx.status = 400
                return ctx.body = { message: 'Only invited Cardholder can see Guests limit' }
            }
            const company = await Company.findOneOrFail({ where: { id: auth_user.company } })
            ctx.body = {
                time_keys: company.time_keys
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
            const location = await locationGenerator(auth_user)
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
                .getOne()
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
                .addSelect('access_point.acu')
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
                        const schedule: Schedule = await Schedule.findOneOrFail({ where: { id: created_cardholder_access_rule.schedule } })
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
                            if (created_cardholder.key_type !== guestKeyType.TEMPORARY && created_cardholder.schedule) {
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
                .addSelect('access_point.acu')
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

            const location = await locationGenerator(auth_user)
            if (req_data.status === cardholderStatus.INACTIVE || req_data.status === cardholderStatus.ACTIVE) {
                const cardholders = await Cardholder.createQueryBuilder('cardholder')
                    .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null')
                    .where(`cardholder.id in(${req_data.ids})`)
                    .andWhere(`cardholder.company = ${company}`)
                    .getMany()
                const save: any = []

                let send_card_key = false
                for (const cardholder of cardholders) {
                    if (cardholder.status !== req_data.status) {
                        cardholder.status = req_data.status
                        save.push(Cardholder.save(cardholder, { transaction: false }))
                    }

                    for (const credential of cardholder.credentials) {
                        if (req_data.status === cardholderStatus.ACTIVE && credential.status === credentialStatus.INACTIVE) {
                            send_card_key = true
                            credential.status = credentialStatus.ACTIVE
                            save.push(Credential.save(credential, { transaction: false }))
                        } else if (req_data.status === cardholderStatus.INACTIVE && credential.status === credentialStatus.ACTIVE) {
                            send_card_key = true
                            credential.status = credentialStatus.INACTIVE
                            save.push(Credential.save(credential, { transaction: false }))
                        }
                    }

                    // CardKeyController.editCardKey(location, company, auth_user.id, null, access_points, [cardholder])
                }
                await Promise.all(save)
                if (send_card_key) {
                    CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, auth_user, null)
                }
                ctx.body = { success: true }
            } else {
                ctx.body = {
                    message: `Invalid status ${req_data.status}`
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
            const check_by_company = await CardholderGroup.findOne({ where, relations: ['limitations'] })
            const location = await locationGenerator(auth_user)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const cardholders = await Cardholder.getAllItems({ where: { id: { in: req_data.ids }, company: { '=': company } }, relations: { limitations: Limitation } })
                var send_card_key = false
                const save = []
                for (const cardholder of cardholders) {
                    if (cardholder.cardholder_group !== req_data.cardholder_group) {
                        cardholder.cardholder_group = req_data.cardholder_group
                    }
                    if (cardholder.access_right_inherited) {
                        if (check_by_company.access_right !== cardholder.access_right) {
                            send_card_key = true
                            cardholder.access_right = check_by_company.access_right
                        }
                    }
                    if (cardholder.limitation_inherited) {
                        if (check_by_company.limitations && cardholder.limitations &&
                            (JSON.stringify(check_by_company.limitations.valid_from) !== JSON.stringify(cardholder.limitations.valid_from) ||
                                JSON.stringify(check_by_company.limitations.valid_due) !== JSON.stringify(cardholder.limitations.valid_due))
                        ) {
                            send_card_key = true
                        }
                        cardholder.limitation = check_by_company.limitation
                    }

                    if (check_by_company.time_attendance !== cardholder.time_attendance) {
                        if (cardholder.time_attendance_inherited) {
                            cardholder.time_attendance = check_by_company.time_attendance
                        }
                    }
                    save.push(Cardholder.updateItem(cardholder, auth_user))
                }
                await Promise.all(save)
                if (send_card_key) {
                    CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, company, auth_user, null)
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
            const location = await locationGenerator(auth_user)

            // const cardholders = await Cardholder.getAllItems({ where: { id: { in: req_data.ids }, company: { '=': company } } })

            const cardholders = await Cardholder.createQueryBuilder('cardholder')
                .select('cardholder.id')
                .addSelect('cardholder.company')
                .leftJoinAndSelect('cardholder.credentials', 'credential', 'credential.delete_date is null and credential.code is not null')
                .where('cardholder.id in (:...ids)', { ids: req_data.ids })
                .andWhere(`cardholder.company = '${company}'`)
                .getMany()

            // const save = []
            // for (const cardholder of cardholders) {
            //     if (cardholder.status !== req_data.status) {
            //         cardholder.status = req_data.status
            //         save.push(Cardholder.destroyItem(cardholder))
            //     }
            // }

            // await Promise.all(save)
            const chs = chunk(cardholders, 500)
            for (const ch of chs) {
                await CardholderController.destroyItemsBulk(ch)
            }
            if (cardholders.length) {
                CardKeyController.dellKeys(location, company, cardholders, auth_user)
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
     *  /cardholder/importXLSX:
     *      post:
     *          tags:
     *              - Cardholder
     *          summary: Upload cardholder data.
     *          consumes:
     *              - multipart/form-data
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                  type: string
     *            - in: formData
     *              name: file
     *              type: file
     *              description: The upload xlsx file.
     *          responses:
     *              '201':
     *                  description: xlsx upload
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async importXLSX (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const user = ctx.user
        const company = user.company

        const all_cardholder_group = await CardholderGroup.findOneOrFail({
            where: {
                default: true,
                company: company
            }
        })

        xlsxj({
            input: file.path,
            output: null
        }, async function (err: any, result: any) {
            if (err) {
                console.error(err)
            } else {
                for (const item of result) {
                    try {
                        const cardholder = await Cardholder.addItem({
                            first_name: item.Person_Name,
                            company_name: item.Organization,
                            cardholder_group: all_cardholder_group.id,
                            access_right_inherited: true,
                            limitation_inherited: true,
                            access_right: all_cardholder_group.access_right,
                            limitation: all_cardholder_group.limitation,
                            company
                        } as Cardholder)

                        const codes = item.Card_No.split(';')
                        for (const code of codes) {
                            try {
                                if (code) {
                                    await Credential.addItem({
                                        code,
                                        cardholder: cardholder.id,
                                        company
                                    } as Credential)
                                }
                            } catch (error) {
                                // console.log('Credential create error', error)
                            }
                        }
                    } catch (error) {
                        // console.log('Cardholder create error', error)
                    }
                }
            }
        })
        ctx.body = { success: true }
        return ctx.body
    }

    public static async destroyItemsBulk (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            Cardholder.softRemove(data)
                .then(async () => {
                    for (const cardholder of data) {
                        minusResource(Cardholder.name, cardholder.company)

                        const cardholder_data: any = await Cardholder.createQueryBuilder('cardholder')
                            .where('id = :id', { id: cardholder.id })
                            .withDeleted()
                            .getOne()

                        cardholder_data.is_delete = (new Date()).getTime()
                        await Cardholder.save(cardholder_data, { transaction: false })

                        for (const credential of cardholder.credentials) {
                            if (!credential.deleteDate) {
                                await Credential.destroyItem(credential)
                            }
                        }

                        if (cardholder_data.guest) {
                            AccessRight.destroyItem({ id: cardholder_data.access_right, company: cardholder_data.company })
                            const access_rules = await AccessRule.find({ where: { access_right: cardholder_data.access_right } })
                            for (const access_rule of access_rules) {
                                AccessRule.destroyItem({ id: access_rule.id, company: cardholder_data.company })
                                const schedule = await Schedule.findOne({ where: { id: access_rule.schedule } })
                                if (schedule) Schedule.destroyItem({ id: access_rule.schedule, company: cardholder_data.company })
                            }
                        }
                    }
                    resolve({ message: 'success' })
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
