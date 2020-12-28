import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
import { Limitation } from '../model/entity/Limitation'
import { Cardholder } from '../model/entity/Cardholder'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { AntipassBack } from '../model/entity/AntipassBack'

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
            req_data.company = auth_user.company ? auth_user.company : null

            let group_data: any
            if (req_data.limitation_inherited || req_data.antipass_back_inherited || req_data.time_attendance_inherited || req_data.access_right_inherited) {
                group_data = await CardholderGroup.getItem({ id: req_data.cardholder_group, company: req_data.company })
            }

            if (req_data.limitation_inherited && group_data) {
                req_data.limitation = group_data.limitation
            } else {
                const limitation_data: any = await Limitation.addItem(req_data.limitations as Limitation)
                req_data.limitation = limitation_data.id
            }

            if (req_data.antipass_back_inherited && group_data) {
                req_data.antipass_back = group_data.antipass_back
            } else {
                const antipass_back_data: any = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
                req_data.antipass_back = antipass_back_data.id
            }

            if (req_data.access_right_inherited && group_data) {
                req_data.access_right = group_data.access_right
            }

            if (req_data.time_attendance_inherited && group_data) {
                req_data.time_attendance = group_data.time_attendance
            }

            const car_info: any = await CarInfo.addItem(req_data.car_infos as CarInfo)
            req_data.car_info = car_info.id

            await Cardholder.addItem(req_data as Cardholder)

            // ctx.body = {
            //     cardholder: cardholder,
            //     car_info: car_info_data,
            //     limitation_data: limitation_data
            // }

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
     *                properties:
     *                    cardholder:
     *                        type: object
     *                        required:
     *                        - id
     *                        properties:
     *                            id:
     *                                type: number
     *                                example: 1
     *                            email:
     *                                type: string
     *                                example: example@gmail.com
     *                            avatar:
     *                                type: string
     *                                example: some_avatar
     *                            password:
     *                                type: string
     *                                example: some_password
     *                            first_name:
     *                                type: string
     *                                example: some_first_name
     *                            last_name:
     *                                type: string
     *                                example: some_last_name
     *                            family_name:
     *                                type: string
     *                                example: some_family_name
     *                            phone:
     *                                type: string
     *                                example: +374 XX XXX XXX
     *                            company_name:
     *                                type: string
     *                                example: some_company_name
     *                            user_account:
     *                                type: boolean
     *                                example: false
     *                            cardholder_group:
     *                                type: number
     *                                example: 1
     *                            status:
     *                                type: inactive | active | expired | noCredential | pending
     *                                example: active
     *                            car_infos:
     *                                type: object
     *                                required:
     *                                properties:
     *                                    id:
     *                                        type: number
     *                                        example: 1
     *                                    model:
     *                                        type: string
     *                                        example: bmw
     *                                    color:
     *                                        type: string
     *                                        example: some_color
     *                                    lp_number:
     *                                        type: number
     *                                        example: 1
     *                                    car_credential:
     *                                        type: string
     *                                        example: some_car_credential
     *                                    car_event:
     *                                        type: boolean
     *                                        example: true
     *                            limitation_inherited:
     *                                type: boolean
     *                                example: true
     *                            limitations:
     *                                type: object
     *                                properties:
     *                                    id:
     *                                        type: number
     *                                        example: 1
     *                                    enable_date:
     *                                        type: boolean
     *                                        example: true
     *                                    valid_from:
     *                                        type: string
     *                                        example: 2020-04-04 00:00:00
     *                                    valid_due:
     *                                        type: string
     *                                        example: 2020-05-05 15:00:00
     *                                    pass_counter_enable:
     *                                        type: boolean
     *                                        example: true
     *                                    pass_counter_passes:
     *                                        type: number
     *                                        example: 25
     *                                    pass_counter_current:
     *                                        type: number
     *                                        example: 10
     *                                    first_use_counter_enable:
     *                                        type: boolean
     *                                        example: true
     *                                    first_use_counter_days:
     *                                        type: number
     *                                        example: 25
     *                                    first_use_counter_current:
     *                                        type: number
     *                                        example: 10
     *                                    last_use_counter_enable:
     *                                        type: boolean
     *                                        example: true
     *                                    last_use_counter_days:
     *                                        type: number
     *                                        example: 25
     *                                    last_use_counter_current:
     *                                        type: number
     *                                        example: 10
     *                            antipass_back_inherited:
     *                                type: boolean
     *                                example: false
     *                            antipass_backs:
     *                                type: object
     *                                properties:
     *                                    id:
     *                                        type: number
     *                                        example: 1
     *                                    type:
     *                                        type: disable | soft | semi_soft | hard | extra_hard
     *                                        example: disable
     *                                    enable_timer:
     *                                        type: boolean
     *                                        example: false
     *                                    time:
     *                                        type: number
     *                                        example: 60
     *                                    time_type:
     *                                        type: seconds | minutes | hours
     *                                        example: minutes
     *                            time_attendance_inherited:
     *                                type: boolean
     *                                example: false
     *                            time_attendance:
     *                                type: number
     *                                example: 1
     *                            access_right_inherited:
     *                                type: boolean
     *                                example: false
     *                            access_right:
     *                                type: number
     *                                example: 1
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
                let group_data: any
                if (req_data.limitation_inherited || req_data.antipass_back_inherited || req_data.time_attendance_inherited || req_data.access_right_inherited) {
                    if (req_data.cardholder_group) {
                        group_data = await CardholderGroup.getItem({ id: req_data.cardholder_group, company: auth_user.company ? auth_user.company : null })
                    } else {
                        const data: any = await Cardholder.getItem({ id: req_data.id, company: auth_user.company ? auth_user.company : null })
                        group_data = await CardholderGroup.getItem({ id: data.cardholder_group, company: auth_user.company ? auth_user.company : null })
                    }
                }

                if (req_data.limitation_inherited && group_data) {
                    req_data.limitation = group_data.limitation
                } else {
                    if (req_data.limitations.id) {
                        await Limitation.updateItem(req_data.limitations as Limitation)
                    } else {
                        const limitation_data: any = await Limitation.addItem(req_data.limitations as Limitation)
                        req_data.limitation = limitation_data.id
                    }
                }

                if (req_data.antipass_back_inherited && group_data) {
                    req_data.antipass_back = group_data.antipass_back
                } else {
                    if (req_data.antipass_backs.id) {
                        await AntipassBack.updateItem(req_data.antipass_backs as AntipassBack)
                    } else {
                        const antipass_back_data: any = await AntipassBack.addItem(req_data.antipass_backs as AntipassBack)
                        req_data.antipass_back = antipass_back_data.id
                    }
                }

                if (req_data.access_right_inherited && group_data) {
                    req_data.access_right = group_data.access_right
                }

                if (req_data.time_attendance_inherited && group_data) {
                    req_data.time_attendance = group_data.time_attendance
                }

                if (req_data.car_infos) {
                    await CarInfo.updateItem(req_data.car_infos)
                }

                const res_data = await Cardholder.updateItem(req_data as Cardholder)

                // ctx.body = {
                //     cardholder: cardholder_data,
                //     car_info: car_info,
                //     limitation: limitation
                // }
                ctx.body = res_data
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
            const relations = ['car_infos', 'limitations']

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
            const where = { id: user.role, company: user.company ? user.company : null }
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
            req_data.relations = ['car_infos', 'limitations']
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
     *  /cardholderImageSave:
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
     *  /cardholderImageDelete:
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
}
