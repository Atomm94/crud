// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Role, Admin } from '../model/entity/index'
// import { getRepository } from 'typeorm'
import { checkPermissionsAccess } from '../functions/check-permissions-access'
import { adminStatus } from '../enums/adminStatus.enum'
import { logUserEvents } from '../enums/logUserEvents.enum'

class RoleController {
  /**
   *
   * @swagger
   *  /roles:
   *      post:
   *          tags:
   *              - Role
   *          summary: Create a role.
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
   *              name: role
   *              description: The role to create.
   *              schema:
   *                type: object
   *                required:
   *                  - slug
   *                  - permissions
   *                properties:
   *                  slug:
   *                      type: string
   *                      example: slug
   *                  permissions:
   *                      type: string
   *                      example: perms
   *          responses:
   *              '201':
   *                  description: A role object
   *              '409':
   *                  description: Conflict
   *              '422':
   *                  description: Wrong data
   */
  public static async createRole (ctx: DefaultContext) {
    try {
      const user = ctx.user
      const req_data = ctx.request.body

      if (await checkPermissionsAccess(user, req_data.permissions)) {
        req_data.company = user.company ? user.company : null
        const role = await Role.addItem(req_data)
        ctx.body = role
      } else {
        ctx.status = 400
        ctx.body = {
          message: 'Permissions access denied!!'
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
   * /roles:
   *      get:
   *          tags:
   *              - Role
   *          summary: Return role list
   *          parameters:
   *              - in: header
   *                name: Authorization
   *                required: true
   *                description: Authentication token
   *                schema:
   *                    type: string
   *          responses:
   *              '200':
   *                  description: Array of role
   *              '401':
   *                  description: Unauthorized
   */
  public static async getRole (ctx: DefaultContext) {
    try {
      const user = ctx.user

      const req_data = ctx.query
      req_data.relations = ['admins']
      req_data.where = {
        company: { '=': user.company ? user.company : null },
        id: { '!=': user.role },
        main: { '!=': true },
        cardholder: { '=': false }
      }

      const roles = await Role.getAllItems(req_data)

      const data = []
      roles.forEach(async (role: Role) => {
        if (await checkPermissionsAccess(user, role.permissions)) {
          data.push(role)
        }
      })
      ctx.body = roles
    } catch (error) {
      ctx.status = error.status || 400
      ctx.body = error
    }
    return ctx.body
  }

  /**
   *
   * @swagger
   * roles/{id}:
   *      get:
   *          tags:
   *              - Role
   *          summary: Return role by ID
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
   *                description: Role Id
   *                schema:
   *                    type: integer
   *          responses:
   *              '200':
   *                  description: OK
   *              '401':
   *                  description: Unauthorized
   */
  public static async getRoleById (ctx: DefaultContext) {
    try {
      const user = ctx.user
      const where = { company: user.company ? user.company : null }
      const role = await Role.getItem(ctx.params.id, where)

      if (await checkPermissionsAccess(user, role.permissions)) {
        ctx.body = role
      } else {
        ctx.status = 400
        ctx.body = {
          message: 'Permissions access denied!!'
        }
      }
    } catch (error) {
      console.log(error)

      ctx.status = error.status || 400
      ctx.body = error
    }
    return ctx.body
  }

  /**
   *
   * @swagger
   *  /roles:
   *      put:
   *          tags:
   *              - Role
   *          summary: Update a role.
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
   *              name: role
   *              description: The role to update.
   *              schema:
   *                type: object
   *                required:
   *                  - id
   *                  - slug
   *                  - permissions
   *                  - status
   *                properties:
   *                  id:
   *                      type: number
   *                      example: 1
   *                  slug:
   *                      type: string
   *                      example: slug
   *                  permissions:
   *                      type: string
   *                      example: permissions
   *                  status:
   *                      type: string
   *                      example: status
   *          responses:
   *              '201':
   *                  description: A role object
   *              '409':
   *                  description: Conflict
   *              '422':
   *                  description: Wrong data
   */
  public static async updateRole (ctx: DefaultContext) {
    const req_data = ctx.request.body
    try {
      const user = ctx.user

      if (user.role === req_data.id) {
        ctx.status = 400
        ctx.body = { message: 'cant change your role!!' }
      } else {
        const where = {
          id: req_data.id,
          company: user.company ? user.company : null,
          main: false
        }
        const role = await Role.findOne({ where })

        if (!role) {
          ctx.status = 400
          ctx.body = { message: 'something went wrong' }
        } else {
          if (!req_data.permissions || await checkPermissionsAccess(user, req_data.permissions)) {
            const updated = await Role.updateItem(req_data)
            ctx.oldData = updated.old
            ctx.body = updated.new
          } else {
            ctx.status = 400
            ctx.body = {
              message: 'Permissions access denied!!'
            }
          }
        }
      }
    } catch (error) {
      console.log(error)

      ctx.status = error.status || 400
      ctx.body = error
    }
    return ctx.body
  }

  /**
   *
   * @swagger
   *  /roles:
   *      delete:
   *          tags:
   *              - Role
   *          summary: Delete a role.
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
   *              name: role
   *              description: The role to delete.
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
   *                  description: Role has been deleted
   *              '409':
   *                  description: Conflict
   *              '422':
   *                  description: Wrong data
   */
  public static async deleteRole (ctx: DefaultContext) {
    let role
    const id = ctx.request.body.id
    try {
      const user = ctx.user

      if (user.role === id) {
        ctx.status = 400
        ctx.body = { message: 'cant delete your role!!' }
      } else {
        const where = {
          id: id,
          company: user.company ? user.company : null,
          main: false
        }
        const check_role_by_company = await Role.findOne({ where })

        if (!check_role_by_company) {
          ctx.status = 400
          ctx.body = { message: 'something went wrong' }
        } else {
          if (await checkPermissionsAccess(user, check_role_by_company.permissions)) {
            const admin:any = await Admin.find({ where: { role: id } })
            if (admin.length) {
              for (let i = 0; i < admin.length; i++) {
                admin[i].role = null
                admin[i].status = adminStatus.INACTIVE
                delete admin[i].password
                await Admin.updateItem(admin[i])
              }
              const role_data = await Role.findOneOrFail({ where: where })
              role = await Role.destroyItem(check_role_by_company)
              ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Role.name}/${role_data.slug}`,
                value: { slug: role_data.slug }
              }]

              if (role) {
                ctx.body = 'Deleted'
              }
            } else {
              role = await Role.destroyItem(check_role_by_company)
              ctx.body = 'Deleted'
            }
          } else {
            ctx.status = 400
            ctx.body = {
              message: 'Permissions access denied!!'
            }
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
   * /access:
   *      get:
   *          tags:
   *              - Role
   *          summary: Return all actions and attributes list
   *          parameters:
   *              - in: header
   *                name: Authorization
   *                required: true
   *                description: Authentication token
   *                schema:
   *                    type: string
   *          responses:
   *              '200':
   *                  description: Array of accesses
   *              '401':
   *                  description: Unauthorized
   */
  public static async getAllAccess (ctx: DefaultContext) {
    const user = ctx.user
    const accesses = await Role.getAllAccess(user)
    ctx.body = accesses
    return ctx.body
  }
}

export default RoleController
