import { PackageType } from './../model/entity/PackageType'
import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Admin, Package, Role } from '../model/entity/index'
import { Company } from '../model/entity/Company'

import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

import { statusCompany } from '../enums/statusCompany.enum'
import { JwtToken } from '../model/entity/JwtToken'
import { adminStatus } from '../enums/adminStatus.enum'
import { addDefaultFeaturesofCompany } from '../functions/addDefaultFeaturesOfCompany'
import { createCustomer, createSubsciption } from '../functions/zoho-utils'
import { validate } from '../functions/passValidator'
import { Sendgrid } from '../../component/sendgrid/sendgrid'

// import { NotFound } from '../../constant/errors';
/**
 * @AnnotationClassString AnnotationClassString
 * @AnnotationClassObject {'hello': 123}
 * @AnnotationClassArray [1234]
 * @AnnotationClassInt 12345
 */
export default class AuthController {
    /**
     *
     * @swagger
     * /sign-up:
     *      post:
     *          tags:
     *              - Company
     *          summary: Create company, account separate from super(independent) and send emails
     *          parameters:
     *              - in: body
     *                name: regForm
     *                description: The registration of Partner.
     *                schema:
     *                  type: object
     *                  required:
     *                      - company
     *                      - account
     *                  properties:
     *                      company:
     *                          type: object
     *                          required:
     *                              - company_name
     *                          properties:
     *                              company_name:
     *                                  type: string
     *                                  example: some_company_name
     *                              message:
     *                                  type: string
     *                                  example: some_message
     *                      account:
     *                          type: object
     *                          required:
     *                              - first_name
     *                              - last_name
     *                              - email
     *                              - phone_1
     *                              - post_code
     *                              - password
     *                          properties:
     *                              first_name:
     *                                  type: string
     *                                  example: John
     *                              last_name:
     *                                  type: string
     *                                  example: Smith
     *                              email:
     *                                  type: string
     *                                  example: example@gmail.com
     *                              phone_1:
     *                                  type: string
     *                                  example: +374XXXXXXXX
     *                              post_code:
     *                                  type: number
     *                                  example: 0068
     *                              password:
     *                                  type: string
     *                                  example: 123456
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */

    public static async sign_up (ctx: DefaultContext) {
        const { company, account } = ctx.request.body
        try {
            if (!('first_name' in account && 'last_name' in account && 'email' in account && 'phone_1' in account && 'password' in account && 'company_name' in company)) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Fill in required inputs!!'
                }
            }

            const { message, success } = validate(account.password)
            if (!success) {
                ctx.status = 400
                return ctx.body = {
                    message: message
                }
            }
            if (await Admin.findOne({ where: { email: account.email } })) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Duplicate email!!'
                }
            }

            const defaultPackageType = await PackageType.findOneOrFail({ where: { default: true } })
            const defaultPackage = await Package.findOneOrFail({ where: { default: true } })

            company.upgraded_package_id = defaultPackage?.id
            company.company_sign_up = true
            company.package_type = defaultPackageType?.id
            company.status = statusCompany.PENDING
            const newCompany = await Company.addItem(company as Company)

            let permissions: string = JSON.stringify(Role.default_partner_role)
            const default_role = await Role.findOne({ where: { slug: 'default_partner' } })
            if (default_role) {
                permissions = default_role.permissions
            }
            const role_save_data = {
                slug: newCompany.company_name,
                company: newCompany.id,
                permissions: permissions,
                main: true
            }
            const new_company_role = await Role.addItem(role_save_data as Role)

            account.company = newCompany.id
            account.role = new_company_role.id
            const admin = await Admin.addItem(account as Admin)

            newCompany.account = admin.id
            await Company.save(newCompany, { transaction: false })

            await addDefaultFeaturesofCompany(newCompany.id)

            await createCustomer(newCompany.id)
            await createSubsciption(newCompany.id)
            await Sendgrid.sendSignUp(admin.email)
            await Sendgrid.InformSuper(process.env.SENDGRID_FROM_EMAIL as string, account, company, admin.id)

            ctx.body = {
                message: 'The user has been successfully registered, confirmation pending'
            }
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /login:
     *      post:
     *          tags:
     *              - Auth
     *          summary: Sign in.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: body
     *              name: login
     *              description: sign in.
     *              schema:
     *                type: object
     *                required:
     *                  - username
     *                  - password
     *                properties:
     *                  username:
     *                      type: string
     *                      example: username
     *                  password:
     *                      type: string
     *                      example: password
     *          responses:
     *              '201':
     *                  description: Sign in
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async login (ctx: DefaultContext) {
        const { username, password } = ctx.request.body
        let checkPass
        let user: any
        let company_main_data: any = {
            company_main: null,
            package: null
        }

        try {
            user = await Admin.findOneOrFail({ where: [{ username }, { email: username }], relations: ['roles', 'companies'] })
        } catch (error) {
            ctx.status = error.status || 401
            ctx.body = { message: 'Wrong username or e-mail' }

            return ctx.body
        }
        if ((user.username || user.email) && user.password) {
            try {
                checkPass = bcrypt.compareSync(password, user.password)
                if (!checkPass) {
                    ctx.status = 400
                    return (ctx.body = {
                        message: 'Wrong password'
                    })
                }
                if (user.companies && user.companies.company_sign_up && user.companies.status === statusCompany.PENDING) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'The account has not been activated yet. Please contact support.'
                    }
                }
                if (user.status !== adminStatus.ACTIVE) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'User status is not valid'
                    }
                } else
                    if (user.company) {
                        const company = await Company.findOneOrFail({ where: { id: user.company } })
                        company_main_data.company_main = company.account
                        company_main_data.package = company.package
                        company_main_data.partition_parent_id = company.partition_parent_id
                        if (company.status === statusCompany.DISABLE || (company.status === statusCompany.PENDING && company.account !== user.id)) {
                            ctx.status = 400
                            return ctx.body = {
                                message: 'Company status is not valid'
                            }
                        }
                    }

                user.last_login_date = new Date().toISOString().slice(0, 19).replace('T', ' ')
                delete user.password
                Admin.save(user, { transaction: false })
                    .then(() => { })
                    .catch(() => {})
            } catch (error) {
                ctx.status = error.status || 400
                return ctx.body = error
            }
        } else {
            ctx.status = 400
            return ctx.body = {
                message: 'Wrong username or password'
            }
        }
        company_main_data = { ...company_main_data, ...user }
        const adminFiltered = _.pick(company_main_data, ['id', 'username', 'last_name', 'first_name', 'email', 'avatar', 'role', 'super', 'department', 'company', 'company_main', 'cardholder', 'package'])

        if (user.company) {
            const company = await Company.findOne({ where: { id: user.company } })
            ctx.companyData = (company) || null
        }

        const expireTime = process.env.TOKEN_EXPIRE_TIME ? process.env.TOKEN_EXPIRE_TIME : 2
        const token = jwt.sign({ companyData: ctx.companyData, ...adminFiltered }, 'jwtSecret', { expiresIn: `${expireTime}h` }) // , { expiresIn: '1h' }

        if (user.status) {
            await JwtToken.addItem({ account: user.id, token: token, expire_time: expireTime } as JwtToken)
            ctx.body = { user: adminFiltered, token: token }
        } else {
            ctx.status = 403
            ctx.body = { message: 'User was blocked' }
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /auth:
     *      get:
     *          tags:
     *              - Auth
     *          summary: Check auth
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: checking
     *              '401':
     *                  description: Unauthorized
     */
    public static async checkAuth (ctx: DefaultContext) {
        let verify

        const token = ctx.request.header.authorization

        try {
            verify = <any>jwt.verify(token, 'jwtSecret')
            if (verify) {
                ctx.body = {
                    success: true
                }
            } else {
                ctx.status = 403
                ctx.body = { message: 'Unauthorized' }
            }
        } catch (error) {
            ctx.status = error.status || 403
            ctx.body = error
            ctx.body = { message: 'Unauthorized' }
        }
        return ctx.body
    }
}
