import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
import { Limitation } from '../model/entity/Limitation'
import { Cardholder } from '../model/entity/Cardholder'
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
     *                properties:
     *                    cardholder:
     *                        type: object
     *                        required:
     *                        - email
     *                        - first_name
     *                        - last_name
     *                        properties:
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
     *                            company:
     *                                type: number
     *                                example: 1
     *                            company_name:
     *                                type: string
     *                                example: some_company_name
     *                            role:
     *                                type: number
     *                                example: 1
     *                            access_right:
     *                                type: number
     *                                example: 1
     *                                minimum: 1
     *                            cardholder_group:
     *                                type: number
     *                                example: 1
     *                            status:
     *                                type: inactive | active | expired | noCredential | pending
     *                                example: active
     *                            antipassback:
     *                                type: boolean
     *                                example: false
     *                    car_info:
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
     *                    limitation:
     *                        type: object
     *                        required:
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
            const auth_user = ctx.user
            const req_data = ctx.request.body
            const cardholder_data = req_data.cardholder
            const limitation_data = req_data.limitation
            const car_info_data = req_data.car_info

            const limitation: any = await Limitation.addItem(limitation_data as Limitation)
            const car_info: any = await CarInfo.addItem(car_info_data as CarInfo)
            cardholder_data.limitation = limitation.id
            cardholder_data.car_info = car_info.id

            cardholder_data.company = auth_user.company ? auth_user.company : null
            const cardholder = await Cardholder.addItem(cardholder_data as Cardholder)

            ctx.body = {
                cardholder: cardholder,
                car_info: car_info_data,
                limitation_data: limitation_data
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
     *                        - email
     *                        - first_name
     *                        - last_name
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
     *                            company:
     *                                type: number
     *                                example: 1
     *                            company_name:
     *                                type: string
     *                                example: some_company_name
     *                            role:
     *                                type: number
     *                                example: 1
     *                            access_right:
     *                                type: number
     *                                example: 1
     *                                minimum: 1
     *                            cardholder_group:
     *                                type: number
     *                                example: 1
     *                            status:
     *                                type: inactive | active | expired | noCredential | pending
     *                                example: active
     *                            antipassback:
     *                                type: boolean
     *                                example: false
     *                    car_info:
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
     *                    limitation:
     *                        type: object
     *                        required:
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
                const cardholder = ctx.request.body.cardholder
                const cardholder_data: any = await Cardholder.updateItem(cardholder as Cardholder)
                const car_info = await CarInfo.updateItem(ctx.request.body.car_info)
                const limitation = await Limitation.updateItem(ctx.request.body.limitation)
                ctx.body = {
                    cardholder: cardholder_data,
                    car_info: car_info,
                    limitation: limitation
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
