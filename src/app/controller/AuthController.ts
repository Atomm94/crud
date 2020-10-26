import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Admin } from '../model/entity/index'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

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

        try {
            user = await Admin.findOneOrFail({ where: [{ username }, { email: username }] })
        } catch (error) {
            ctx.status = error.status || 401
            ctx.body = { message: 'Wrong username or e-mail' }

            return ctx.body
        }

        if (user.username && user.password) {
            try {
                checkPass = bcrypt.compareSync(password, user.password)
                if (!checkPass) {
                    ctx.status = 400
                    return (ctx.body = {
                        message: 'Wrong password'
                    })
                } else {
                    user.last_login_date = new Date().toISOString().slice(0, 19).replace('T', ' ')
                    delete user.password
                    Admin.save(user)
                }
            } catch (error) {
                ctx.status = error.status || 400
                return ctx.body = error
            }
        }

        const adminFiltered = _.pick(user, ['id', 'username', 'full_name', 'email', 'avatar', 'role'])
        const token = jwt.sign(adminFiltered, 'jwtSecret', { expiresIn: '2h' }) // , { expiresIn: '1h' }

        if (user.status) {
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
                ctx.body = { message: 'Unauthorizated' }
            }
        } catch (error) {
            ctx.status = error.status || 403
            ctx.body = error
            ctx.body = { message: 'Unauthorizated' }
        }
        return ctx.body
    }
}
