import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { getRepository } from 'typeorm'
import { Admin, Package, Role } from '../model/entity/index'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import fs from 'fs'
import { logger } from '../../../modules/winston/logger'
import { join } from 'path'
import { validate } from '../functions/passValidator'
import { Sendgrid } from '../../component/sendgrid/sendgrid'
import { uid } from 'uid'
import { checkPermissionsAccess } from '../functions/check-permissions-access'
import { AccountGroup } from '../model/entity/AccountGroup'

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
     *  /account:
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
     *                      type: boolean
     *                      example: false
     *                  whatsapp:
     *                      type: boolean
     *                      example: false
     *                  telegram:
     *                      type: boolean
     *                      example: false
     *                  comment:
     *                      type: string
     *                      example: comment
     *                  account_group:
     *                      type: number
     *                      example: 1
     *                  role_inherited:
     *                      type: boolean
     *                      example: false
     *                  date_format:
     *                      type: string
     *                      example: MM/DD/YYYY
     *                  time_format:
     *                      type: string
     *                      example: 24h
     *                  time_zone:
     *                      type: string
     *                      example: +7
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
        let check_group

        if (validate(reqData.password).success) {
            try {
                if (reqData.role_inherited && reqData.account_group) {
                    const account_group = await AccountGroup.findOne({
                        id: reqData.account_group,
                        company: user.company ? user.company : null
                    })
                    if (account_group && account_group.role) {
                        reqData.role = account_group.role
                        check_group = false
                    }
                }

                if (ctx.user.company && !check_group) {
                    ctx.status = 400
                    ctx.body = {
                        message: 'AccountGroup was not found!!'
                    }
                    return ctx
                } else {
                    if (reqData.role) {
                        role = await Role.findOne({
                            id: reqData.role,
                            company: user.company ? user.company : null
                        })
                        if (role) {
                            if (await checkPermissionsAccess(user, role.permissions)) {
                                newAdmin = await Admin.addItem(reqData, user)

                                if (newAdmin && role) {
                                    ctx.body = { newAdmin }
                                }
                            } else {
                                ctx.status = 400
                                ctx.body = {
                                    message: 'Permissions access denied!!'
                                }
                            }
                        } else {
                            ctx.status = 400
                            ctx.body = { message: 'something went wrong' }
                        }
                    } else {
                        newAdmin = await Admin.addItem(reqData, user)

                        if (newAdmin && role) {
                            ctx.body = { newAdmin }
                        }
                    }
                }
            } catch (error) {
                console.log('error', error)

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
     *  /account/invite:
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
     *                properties:
     *                  username:
     *                      type: string
     *                      example: username
     *                  first_name:
     *                      type: string
     *                      example: name
     *                  email:
     *                      type: string
     *                      example: example@gmail.com
     *                  role:
     *                      type: number
     *                      example: 5
     *                  account_group:
     *                      type: number
     *                      example: 5
     *                  comment:
     *                      type: string
     *                      example: comment
     *          responses:
     *              '201':
     *                  description: A admin object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async inviteAdmin (ctx: DefaultContext) {
        const reqData = ctx.request.body
        const user = ctx.user
        if (user.company) reqData.company = user.company
        reqData.verify_token = uid(32)
        let role

        try {
            const newAdmin: Admin = await Admin.addItem(reqData, user)
            role = await Role.findOne({
                id: reqData.role
            })
            if (newAdmin && role) {
                ctx.body = { success: true }
                if (newAdmin.verify_token) {
                    await Sendgrid.SetPass(newAdmin.email, newAdmin.verify_token)
                }
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
        return ctx.body
    }

    /**
     *
     * @swagger
     * /account/getUserData:
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
                ctx.body.package = ctx.user.package ? ctx.user.package : null
                if (ctx.user && ctx.user.company && ctx.user.package) {
                    const packageData = await Package.findOne(ctx.user.package)
                    if (packageData && packageData.extra_settings) {
                        const extra_settings = JSON.parse(packageData.extra_settings)
                        if (extra_settings.features) {
                            ctx.body.features = extra_settings.features
                        }
                    }
                }
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
       *  /account/changePass:
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
            ctx.oldData = Object.assign({}, user)
            checkPass = bcrypt.compareSync(reqData.password, user.password)

            if (checkPass) {
                ctx.status = 400
                ctx.body = {
                    message: 'New Password cannot be the same as previously used password'
                }
            } else {
                if (validate(reqData.password).success) {
                    user.password = reqData.password
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
       *  /account/changeMyPass:
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
                    ctx.oldData = Object.assign({}, user)
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
     *  /account:
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
     *                      type: boolean
     *                      example: false
     *                  whatsapp:
     *                      type: boolean
     *                      example: false
     *                  telegram:
     *                      type: boolean
     *                      example: false
     *                  comment:
     *                      type: string
     *                      example: comment
     *                  account_group:
     *                      type: number
     *                      example: 1
     *                  role_inherited:
     *                      type: boolean
     *                      example: false
     *                  date_format:
     *                      type: string
     *                      example: MM/DD/YYYY
     *                  time_format:
     *                      type: string
     *                      example: 24h
     *                  time_zone:
     *                      type: string
     *                      example: +7
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
        const user = ctx.user
        let check_group = true

        try {
            const admin = await Admin.findOne({
                id: reqData.id,
                company: user.company ? user.company : null
            })
            if (admin) {
                if (reqData.role_inherited && reqData.account_group) {
                    const account_group = await AccountGroup.findOne({
                        id: reqData.account_group,
                        company: user.company ? user.company : null
                    })
                    if (account_group && account_group.role) {
                        reqData.role = account_group.role
                    } else {
                        check_group = false
                    }
                }
                if (!check_group) {
                    ctx.status = 400
                    ctx.body = {
                        message: 'AccountGroup was not found!!'
                    }
                } else {
                    if (reqData.role) {
                        const role = await Role.findOne({
                            id: reqData.role,
                            company: user.company ? user.company : null
                        })
                        if (role) {
                            if (await checkPermissionsAccess(user, role.permissions)) {
                                const updated = await Admin.updateItem(reqData)
                                ctx.oldData = updated.old
                                ctx.body = updated.new
                            } else {
                                ctx.status = 400
                                ctx.body = {
                                    message: 'Permissions access denied!!'
                                }
                            }
                        } else {
                            ctx.status = 400
                            ctx.body = { message: 'something with role went wrong' }
                        }
                    } else {
                        const updated = await Admin.updateItem(reqData)
                        ctx.oldData = updated.old
                        ctx.body = updated.new
                    }
                }
            } else {
                ctx.status = 400
                ctx.body = { message: 'something went wrong' }
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
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /account/{id}:
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
            const user = ctx.user
            const where: any = { id: adminId, company: user.company ? user.company : null }

            if (!user.company && !user.super) {
                where.super = false
            }
            const relations = ['departments']
            admin = await Admin.getItem(where, relations)
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
     *  /account:
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
        const user = ctx.user
        try {
            const where = { id: reqData.id, company: user.company ? user.company : null }
            ctx.body = await Admin.destroyItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /account:
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
        const where: any = { company: { '=': user.company ? user.company : null }, id: { '!=': user.id } }
        if (!user.company && !user.super) {
            where.super = { '=': false }
        }
        req_data.where = where

        if (name) {
            req_data.orWhere = [
                { username: { contains: name } },
                { email: { contains: name } }
            ]
        }
        allAdmin = await Admin.getAllItems(req_data)

        return (ctx.body = allAdmin)
    }

    /**
     *
     * @swagger
     *  /account/image:
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
    public static async accountImageSave (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = await Admin.saveImage(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /account/image:
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
    public static async accountImageDelete (ctx: DefaultContext) {
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
     * /account/invite/{token}:
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
     * /account/invite/{token}:
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

    /**
     *
     * @swagger
     *  /account/forgotPassword:
     *      post:
     *          tags:
     *              - Admin
     *          summary: Send admin password recovery.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: body
     *              name: admin
     *              description: The password recovery.
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
     *                  description: pass recovery
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async forgotPassword (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const admin = await Admin.findOneOrFail({
                email: reqData.email
            })
            if (admin) {
                admin.verify_token = uid(32)
                await admin.save()
                if (admin) {
                    ctx.body = { success: true }
                    if (admin.verify_token) {
                        await Sendgrid.recoveryPassword(admin.email, admin.verify_token)
                    }
                }
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
            return ctx.body
        }
        return ctx.body
    }
}
