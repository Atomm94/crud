import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Admin } from '../model/entity/index'
import { Company } from '../model/entity/Company'

import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

import { statusCompany } from '../enums/statusCompany.enum'
import { JwtToken } from '../model/entity/JwtToken'

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
        let user: Admin
        let company_main_data: any = {}

        try {
            user = await Admin.findOneOrFail({ where: [{ username }, { email: username }] })
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
                } else {
                    company_main_data.company_main = null
                    if (user.company) {
                        const company = await Company.findOneOrFail({ id: user.company })
                        company_main_data.company_main = company.account
                        if (company.status === statusCompany.DISABLE || (company.status === statusCompany.PENDING && company.account !== user.id)) {
                            ctx.status = 400
                            return ctx.body = {
                                message: 'Company status is not valid!!'
                            }
                        }
                    }

                    user.last_login_date = new Date().toISOString().slice(0, 19).replace('T', ' ')
                    delete user.password
                    Admin.save(user)
                }
            } catch (error) {
                ctx.status = error.status || 400
                return ctx.body = error
            }
        }
        company_main_data = { ...company_main_data, ...user }
        const adminFiltered = _.pick(company_main_data, ['id', 'username', 'last_name', 'first_name', 'email', 'avatar', 'role', 'super', 'department', 'company', 'company_main'])

        if (user.company) {
            const company = await Company.findOne(user.company)
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
