import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
import { Limitation } from '../model/entity/Limitation'
import { Cardholder } from '../model/entity/Cardholder'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { AntipassBack } from '../model/entity/AntipassBack'
import { Credential } from '../model/entity/Credential'
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
     *                                type: number
     *                                example: 1
     *                            car_credential:
     *                                type: string
     *                                example: some_car_credential
     *                            car_event:
     *                                type: boolean
     *                                example: true
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
     *                    antipass_backs:
     *                        type: object
     *                        properties:
     *                            type:
     *                                type: disable | soft | semi_soft | hard | extra_hard
     *                                example: disable
     *                            enable_timer:
     *                                type: boolean
     *                                example: false
     *                            time:
     *                                type: number
     *                                example: 60
     *                            time_type:
     *                                type: seconds | minutes | hours
     *                                example: minutes
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
     *                                    type: rfid | pinpass | vikey| phone_bt | phone_nfc | fingerprint | face | face_temperature | car_lp_number
     *                                    example: rfid
     *                                code:
     *                                    type: string
     *                                    example: 1245644
     *                                status:
     *                                    type: active | stolen | lost
     *                                    example: active
     *                                cardholder:
     *                                    type: number
     *                                    example: 1
     *                                facility:
     *                                    type: number
     *                                    example: 2
     *                                input_mode:
     *                                    type: serial_number | wiegand_26
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
            // const location = `${auth_user.company_main}/${auth_user.company}`
            req_data.company = auth_user.company ? auth_user.company : null
            let group_data: any
            if (req_data.limitation_inherited || req_data.antipass_back_inherited || req_data.time_attendance_inherited || req_data.access_right_inherited) {
                group_data = await CardholderGroup.getItem({ id: req_data.cardholder_group, company: req_data.company })
            }

            if (req_data.limitation_inherited && group_data) {
                req_data.limitation = group_data.limitation
            } else {
                const limitation_data = await Limitation.addItem(req_data.limitations as Limitation)
                if (limitation_data) {
                    req_data.limitation = limitation_data.id
                }
            }

            if (req_data.antipass_back_inherited && group_data) {
                req_data.antipass_back = group_data.antipass_back
            } else {
                const antipass_back_data = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
                if (antipass_back_data) {
                    req_data.antipass_back = antipass_back_data.id
                }
            }

            if (req_data.access_right_inherited && group_data) {
                req_data.access_right = group_data.access_right
            }

            if (req_data.time_attendance_inherited && group_data) {
                req_data.time_attendance = group_data.time_attendance
            }
            if (req_data.car_info) {
                const car_info = await CarInfo.addItem(req_data.car_infos as CarInfo)
                if (car_info) {
                    req_data.car_info = car_info.id
                }
            }
            const cardholder = await Cardholder.addItem(req_data as Cardholder)
            if (req_data.credentials) {
                const credentials: any = []
                    for (const credential of req_data.credentials) {
                        credential.company = req_data.company
                        credential.cardholder = cardholder.id
                        credentials.push(await Credential.addItem(credential as Credential))
                    }
                // new SendDeviceMessage(OperatorType.SET_CARD_KEYS, location, acu.serial_number, credentials, acu.session_id)
            }

            if (cardholder) {
                const where = { id: cardholder.id }
                const relations = ['car_infos', 'limitations', 'antipass_backs', 'time_attendances', 'access_rights', 'cardholder_groups', 'credentials']
                ctx.body = await Cardholder.getItem(where, relations)
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
     *                              type: number
     *                              example: 1
     *                          car_credential:
     *                              type: string
     *                              example: some_car_credential
     *                          car_event:
     *                              type: boolean
     *                              example: true
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
     *                  antipass_backs:
     *                      type: object
     *                      properties:
     *                          id:
     *                              type: number
     *                              example: 1
     *                          type:
     *                              type: disable | soft | semi_soft | hard | extra_hard
     *                              example: disable
     *                          enable_timer:
     *                              type: boolean
     *                              example: false
     *                          time:
     *                              type: number
     *                              example: 60
     *                          time_type:
     *                              type: seconds | minutes | hours
     *                              example: minutes
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
     *                                  type: active | stolen | lost
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
            const where = { id: req_data.id, company: auth_user.company ? auth_user.company : null }
            const check_by_company = await Cardholder.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const res_data = await Cardholder.updateItem(req_data as Cardholder, auth_user)
                if (!req_data.credentials.id) {
                    const credentials: any = []
                    for (const credential of req_data.credentials) {
                        credential.company = auth_user.company
                        credential.cardholder = res_data.id
                        credentials.push(await Credential.addItem(credential as Credential))
                    }
                console.log('req_data.credentials', credentials)
                // new SendDeviceMessage(OperatorType.SET_CARD_KEYS, location, acu.serial_number, credentials, acu.session_id)
                }
                ctx.oldData = res_data.old
                ctx.body = res_data.new

                const where = { id: req_data.id }
                const relations = ['car_infos', 'limitations', 'antipass_backs', 'time_attendances', 'access_rights', 'cardholder_groups', 'credentials']
                ctx.body = await Cardholder.getItem(where, relations)
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
            const where = { id: +ctx.params.id, company: user.company ? user.company : user.company }
            const relations = ['car_infos', 'limitations', 'antipass_backs', 'time_attendances', 'access_rights', 'cardholder_groups', 'credentials']
            ctx.body = await Cardholder.getItem(where, relations)
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
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company = await Cardholder.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await Cardholder.destroyItem(req_data as { id: number })
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
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            req_data.relations = ['car_infos', 'limitations', 'antipass_backs', 'time_attendances', 'access_rights', 'cardholder_groups', 'credentials']
            ctx.body = await Cardholder.getAllItems(req_data)
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
}
