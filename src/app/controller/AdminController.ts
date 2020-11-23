import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { getRepository } from 'typeorm'
import { Admin, Role } from '../model/entity/index'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import fs from 'fs'
import { logger } from '../../../modules/winston/logger'
import { join } from 'path'
import { validate } from '../functions/passValidator'

const parentDir = join(__dirname, '../..')

if (!fs.existsSync(`${parentDir}/public/`)) {
    logger.info('!!!exists')

    fs.mkdirSync(`${parentDir}/public`)
}

// import { NotFound } from '../../constant/errors';
/**
 * @AnnotationClassString AnnotationClassString
 * @AnnotationClassObject {'hello': 123}
 * @AnnotationClassArray [1234]
 * @AnnotationClassInt 12345
 */
export default class AdminController {
    /**
     *
     * @swagger
     *  /users:
     *      post:
     *          tags:
     *              - Admin
     *          summary: Create a admin.
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
     *                  - username
     *                  - status
     *                  - role
     *                  - password
     *                properties:
     *                  username:
     *                      type: string
     *                      example: username
     *                  email:
     *                      type: string
     *                      example: example@gmail.com
     *                  password:
     *                      type: string
     *                      example: password
     *                  status:
     *                      type: boolean
     *                      example: true
     *                  role:
     *                      type: number
     *                      example: 5
     *                  department:
     *                      type: number
     *                      example: 1
     *                  avatar:
     *                      type: string
     *                      example: avatar
     *                  first_name:
     *                      type: string
     *                      example: John
     *                  last_name:
     *                      type: string
     *                      example: Smith
     *                  phone_1:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  phone_2:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  post_code:
     *                      type: string
     *                      example: 0000
     *                  country:
     *                      type: string
     *                      example: some country name
     *                  city:
     *                      type: string
     *                      example: some city name
     *                  site:
     *                      type: string
     *                      example: some site name
     *                  address:
     *                      type: string
     *                      example: some address
     *                  viber:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  whatsapp:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  company:
     *                      type: string
     *                      example: +374 XX XXX XXX

     *          responses:
     *              '201':
     *                  description: A admin object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createAdmin (ctx: DefaultContext) {
        const reqData = ctx.request.body
        const user = ctx.user
        if (user.company) reqData.company = user.company

        let newAdmin
        let role

        if (validate(reqData.password).success) {
            try {
                newAdmin = await Admin.features.AdminOperation.addItem(reqData, user)
                role = await Role.findOne({
                    id: reqData.role
                })

                if (newAdmin && role) {
                    ctx.body = { newAdmin }
                }
            } catch (error) {
                ctx.status = error.status || 400
                ctx.body = error
                if (error.detail && error.detail.includes('username')) {
                    ctx.body.errorMsg = `username ${reqData.username} already exists.`
                    ctx.body.err = 'username'
                } else if (error.detail && error.detail.includes('email')) {
                    ctx.body.err = 'email'
                    ctx.body.errorMsg = `email ${reqData.email} already exists.`
                }

                return ctx.body
            }

            const adminFiltered = _.pick(newAdmin, ['id', 'username', 'email'])
            const token = jwt.sign(adminFiltered, 'jwtSecret', { expiresIn: '2h' })
            ctx.body = { user: adminFiltered, token: token }
        } else {
            ctx.status = 400
            ctx.body = {
                message: validate(reqData.password).message
            }
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /getUserData:
     *      get:
     *          tags:
     *              - Admin
     *          summary: Return admin by ID
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: OK
     */

    public static async getUserData (ctx: DefaultContext) {
        let admin
        try {
            if (ctx.user) {
                admin = await Admin.findOneOrFail(ctx.user.id)
                const adminFiltered = _.omit(admin, ['password', 'super', 'verify_token'])
                ctx.body = adminFiltered
            } else {
                ctx.status = 401
            }
        } catch (error) {
            ctx.status = 401
            ctx.body = error
        }
        return ctx.body
    }

    /**
       *
       * @swagger
       *  /changePass:
       *      put:
       *          tags:
       *              - Admin
       *          summary: Change password.
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
       *              name: admin
       *              description: The admin to create.
       *              schema:
       *                type: object
       *                required:
       *                  - id
       *                properties:
       *                  id:
       *                      type: number
       *                  password:
       *                      type: string
       *                example:
       *                    {
       *                         id: 1,
       *                         password: 'my_pass',
       *                    }
       *          responses:
       *              '201':
       *                  description: A admin updated object
       *              '409':
       *                  description: Conflict
       *              '422':
       *                  description: Wrong data
       */

    public static async changePass (ctx: DefaultContext) {
        const userRepository = getRepository(Admin)
        const reqData = ctx.request.body
        let updatedUser
        let user
        let checkPass
        try {
            user = await userRepository.findOneOrFail({ id: reqData.id })

            checkPass = bcrypt.compareSync(reqData.password, user.password)

            if (checkPass) {
                ctx.status = 400
                ctx.body = {
                    message: 'New Password cannot be the same as previously used password'
                }
            } else {
                if (validate(reqData.password).success) {
                    updatedUser = await userRepository.save(user)
                    ctx.body = updatedUser
                } else {
                    ctx.status = 400
                    ctx.body = {
                        message: validate(reqData.password).message
                    }
                }
            }

            return ctx.body
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
       *
       * @swagger
       *  /changeMyPass:
       *      put:
       *          tags:
       *              - Admin
       *          summary: Change my password.
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
       *              name: admin
       *              description: The admin to create.
       *              schema:
       *                type: object
       *                required:
       *                  - id
       *                properties:
       *                  id:
       *                      type: number
       *                  old_password:
       *                      type: string
       *                  password:
       *                      type: string
       *                example:
       *                    {
       *                         id: 1,
       *                         old_password: 'my_pass',
       *                         password: 'my_new_pass',
       *                    }
       *          responses:
       *              '201':
       *                  description: A admin updated object
       *              '409':
       *                  description: Conflict
       *              '422':
       *                  description: Wrong data
       */

    public static async changeMyPass (ctx: DefaultContext) {
        const { id, old_password, password } = ctx.request.body
        const userRepository = getRepository(Admin)
        let checkPass
        const reqData = ctx.request.body
        let updatedUser
        let user

        try {
            if (!validate(password).success) {
                ctx.status = 400
                ctx.body = {
                    message: validate(password).message
                }
            } else {
                user = await userRepository.findOneOrFail({ id: id })

                if (user && user.password) {
                    checkPass = bcrypt.compareSync(old_password, user.password)

                    if (checkPass) {
                        if (reqData.password) user.password = password
                        updatedUser = await userRepository.save(user)
                        ctx.body = updatedUser
                    } else {
                        ctx.status = 400
                        ctx.body = { message: 'Incorrect Password' }
                    }
                } else {
                    ctx.status = 400
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
     *  /users:
     *      put:
     *          tags:
     *              - Admin
     *          summary: Update an admin.
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
     *              name: admin
     *              description: The admin to update.
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
     *                      example: 'example@test.com'
     *                  password:
     *                      type: string
     *                      example: newPassword
     *                  status:
     *                      type: boolean
     *                      example: true
     *                  role:
     *                      type: number
     *                      example: 5
     *                  department:
     *                      type: number
     *                      example: 1
     *                  avatar:
     *                      type: string
     *                      example: avatar
     *                  first_name:
     *                      type: string
     *                      example: John
     *                  last_name:
     *                      type: string
     *                      example: Smith
     *                  phone_1:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  phone_2:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  post_code:
     *                      type: string
     *                      example: 0000
     *                  country:
     *                      type: string
     *                      example: some country name
     *                  city:
     *                      type: string
     *                      example: some city name
     *                  site:
     *                      type: string
     *                      example: some site name
     *                  address:
     *                      type: string
     *                      example: some address
     *                  viber:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *                  whatsapp:
     *                      type: string
     *                      example: +374 XX XXX XXX
     *          responses:
     *              '201':
     *                  description: A market updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async update (ctx: DefaultContext) {
        const reqData = ctx.request.body
        let edAdmin

        try {
            edAdmin = await Admin.features.AdminOperation.updateItem(reqData)
            ctx.body = edAdmin
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error

            if (error.detail.includes('username')) {
                ctx.body.errorMsg = `username ${reqData.username} already exists.`
                ctx.body.err = 'username'
            } else if (error.detail.includes('email')) {
                ctx.body.err = 'email'
                ctx.body.errorMsg = `email ${reqData.email} already exists.`
            }
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /users/{id}:
     *      get:
     *          tags:
     *              - Admin
     *          summary: Return admin by ID
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: path
     *                name: id
     *                required: true
     *                description: Admin Id
     *                schema:
     *                    type: integer
     *                    minimum: 1
     *          responses:
     *              '200':
     *                  description: OK
     */
    public static async get (ctx: DefaultContext) {
        const adminId: number = +ctx.params.id
        let admin
        const role = {}
        try {
            const relations = ['departments']
            admin = await Admin.features.AdminOperation.getItem(adminId, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
            return ctx.body
        }
        if (!admin) return (ctx.body = '')
        return (ctx.body = {
            admin,
            role
        })
    }

    /**
     *
     * @swagger
     *  /users:
     *      delete:
     *          tags:
     *              - Admin
     *          summary: Delete a admin.
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
     *              name: user
     *              description: The user to delete.
     *              schema:
     *                type: number
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '200':
     *                  description: Admin has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        const reqData = ctx.request.body
        let result
        try {
            result = await Admin.features.AdminOperation.destroyItem(reqData.id)
            ctx.body = {
                success: true,
                result
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
     * /users:
     *      get:
     *          tags:
     *              - Admin
     *          summary: Return admin list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: name
     *                description: search
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of admin
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        const name = ctx.query.name
        const user = ctx.user
        var allAdmin

        const req_data = ctx.query
        req_data.relations = ['departments']
        req_data.where = { company: { '=': user.company ? user.company : null } }

        if (name) {
            req_data.orWhere = [
                { username: { contains: name } },
                { email: { contains: name } }
            ]
        }
        allAdmin = await Admin.features.AdminOperation.getAllItems(req_data)

        return (ctx.body = allAdmin)
    }

    /**
     *
     * @swagger
     *  /userImageSave:
     *      post:
     *          tags:
     *              - Admin
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
        const savedFile = await Admin.saveImage(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /userImageDelete:
     *      delete:
     *          tags:
     *              - Admin
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
            Admin.deleteImage(name)
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
     * /account/{token}:
     *      get:
     *          tags:
     *              - Admin
     *          summary: Return account by token
     *          parameters:
     *              - name: token
     *                in: path
     *                required: true
     *                description: account description
     *                schema:
     *                    type: string
     *                    minimum: 1
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async getUserByToken (ctx: DefaultContext) {
        const verify_token: string = ctx.params.token
        const user = await Admin.findOne({ verify_token: verify_token })
        if (user) {
            ctx.body = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
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
     * /account/{token}:
     *      put:
     *          tags:
     *              - Admin
     *          summary: Set user password
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
    public static async setPassword (ctx: DefaultContext) {
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
}
