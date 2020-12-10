import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
import { Limitation } from '../model/entity/Limitation'
import { User } from '../model/entity/User'
export default class UserController {
    /**
     *
     * @swagger
     *  /user:
     *      post:
     *          tags:
     *              - User
     *          summary: Creates a user.
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
     *              name: user
     *              description: The user to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                    user:
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
     *                            access_right_group:
     *                                type: number
     *                                example: 1
     *                                minimum: 1
     *                            user_group:
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
     *                  description: A user object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const auth_user = ctx.user
            const req_data = ctx.request.body
            const user_data = req_data.user
            const limitation_data = req_data.limitation
            const car_info_data = req_data.car_info

            const limitation: any = await Limitation.addItem(limitation_data as Limitation)
            const car_info: any = await CarInfo.addItem(car_info_data as CarInfo)
            user_data.limitation = limitation.id
            user_data.car_info = car_info.id

            user_data.company = auth_user.company ? auth_user.company : null
            const user = await User.addItem(user_data as User)

            ctx.body = {
                user: user,
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
     *  /user:
     *      put:
     *          tags:
     *              - User
     *          summary: Update a user.
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
     *              name: user
     *              description: The user to create.
     *              schema:
     *                type: object
     *                properties:
     *                    user:
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
     *                            access_right_group:
     *                                type: number
     *                                example: 1
     *                                minimum: 1
     *                            user_group:
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
     *                  description: A user updated object
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
            const check_by_company = await User.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                const user = ctx.request.body.user
                const user_data: any = await User.updateItem(user as User)
                const car_info = await CarInfo.updateItem(ctx.request.body.car_info)
                const limitation = await Limitation.updateItem(ctx.request.body.limitation)
                ctx.body = {
                    user: user_data,
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
     * /user/{id}:
     *      get:
     *          tags:
     *              - User
     *          summary: Return user by ID
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

            ctx.body = await User.getItem(where, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /user:
     *      delete:
     *          tags:
     *              - User
     *          summary: Delete a user.
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
     *              name: user
     *              description: The user to create.
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
     *                  description: user has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: user.role, company: user.company ? user.company : null }
            const check_by_company = await User.findOne(where)

            if (!check_by_company) {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
            } else {
                ctx.body = await User.destroyItem(req_data as { id: number })
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
     * /user:
     *      get:
     *          tags:
     *              - User
     *          summary: Return user list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of user
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            req_data.where = { company: { '=': user.company ? user.company : null } }
            req_data.relations = ['car_infos', 'limitations']
            ctx.body = await User.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /userImageSave:
     *      post:
     *          tags:
     *              - User
     *          summary: Upload user image.
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
     *              description: The upload user image.
     *          responses:
     *              '201':
     *                  description: image upload
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async userImageSave (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = await User.saveImage(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /userImageDelete:
     *      delete:
     *          tags:
     *              - User
     *          summary: Delete an user image.
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
     *              description: The user image name to delete.
     *              schema:
     *                type: string
     *                required:
     *                  - name
     *                properties:
     *                  name:
     *                      type: string
     *          responses:
     *              '200':
     *                  description: User image has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async userImageDelete (ctx: DefaultContext) {
        const name = ctx.request.body.name

        try {
            User.deleteImage(name)
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
