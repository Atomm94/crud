// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Role, Admin } from '../model/entity/index'
// import { getRepository } from 'typeorm'

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
   *                  - name
   *                  - perms
   *                properties:
   *                  name:
   *                      type: string
   *                      example: name
   *                  perms:
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
      const reqData = ctx.request.body
      const role = await Role.addItem(reqData)
      ctx.body = role
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
    let role

    try {
      role = await Role.getRole()
      ctx.body = role
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
   *                    minimum: 1
   *          responses:
   *              '200':
   *                  description: OK
   *              '401':
   *                  description: Unauthorized
   */
  public static async getRoleById (ctx: DefaultContext) {
    try {
      const role = await Role.getItem(ctx.params.id)
      ctx.body = role
    } catch (error) {
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
   *                  - name
   *                  - perms
   *                  - status
   *                properties:
   *                  name:
   *                      type: string
   *                      example: name
   *                  perms:
   *                      type: string
   *                      example: perms
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
    const body = ctx.request.body
    try {
      const updatedRole = await Role.updateItem(body)
      ctx.body = updatedRole
    } catch (error) {
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
      const admin = await Admin.find({ role: id })
      if (admin.length) {
        for (let i = 0; i < admin.length; i++) {
          admin[i].role = null
          admin[i].status = false
          delete admin[i].password
          await Admin.updateItem(admin[i])
        }

        role = await Role.destroyItem(id)

        if (role) {
          ctx.body = 'Deleted'
        }
      } else {
        role = await Role.destroyItem(id)
        ctx.body = 'Deleted'
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
    const accesses = Role.getAllAccess()
    ctx.body = accesses
    return ctx.body
  }
}

export default RoleController
