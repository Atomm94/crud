// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Menu } from '../model/entity/index'

class MenuController {
    /**
     *
     * @swagger
     * /menu:
     *      get:
     *          tags:
     *              - Menu
     *          summary: Return menu list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of menu
     *              '401':
     *                  description: Unauthorized
     */
    public static async getMenu (ctx: DefaultContext) {
        let menu: any
        try {
            menu = await Menu.getAllItems(ctx.query)
            ctx.body = menu.filter((m: any) => !m.parent_id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /menu:
     *      post:
     *          tags:
     *              - Menu
     *          summary: Create a menu.
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
     *              name: menu
     *              description: The menu to create.
     *              schema:
     *                type: object
     *                required:
     *                  - title
     *                  - url
     *                  - translated_name
     *                  - show
     *                  - status
     *                  - parent_id
     *                properties:
     *                  title:
     *                      type: string
     *                      example: title
     *                  url:
     *                      type: string
     *                      example: url
     *                  translated_name:
     *                      type: string
     *                      example: translated_name
     *                  show:
     *                      type: string
     *                      example: show
     *                  status:
     *                      type: string
     *                      example: status
     *                  parent_id:
     *                      type: number
     *                      example: 5
     *          responses:
     *              '201':
     *                  description: A menu object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createMenu (ctx: DefaultContext) {
        const reqData = ctx.request.body

        try {
            const menus = await Menu.addItem(reqData)
            ctx.body = menus
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /menu:
     *      put:
     *          tags:
     *              - Menu
     *          summary: update a menu.
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
     *              name: menu
     *              description: The menu to update.
     *              schema:
     *                type: object
     *                required:
     *                  - title
     *                  - url
     *                  - translated_name
     *                  - show
     *                  - status
     *                  - parent_id
     *                properties:
     *                  title:
     *                      type: string
     *                      example: title
     *                  url:
     *                      type: string
     *                      example: url
     *                  translated_name:
     *                      type: string
     *                      example: translated_name
     *                  show:
     *                      type: string
     *                      example: show
     *                  status:
     *                      type: string
     *                      example: status
     *                  parent_id:
     *                      type: number
     *                      example: 5
     *          responses:
     *              '201':
     *                  description: A menu object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateMenu (ctx: DefaultContext) {
        const body = ctx.request.body
        try {
            const updatedSocialLink = await Menu.updateItem(body)
            ctx.body = updatedSocialLink
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /updateMenuStatus:
     *      put:
     *          tags:
     *              - Menu
     *          summary: update a menu status.
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
     *              name: menu
     *              description: The menu status to update.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                  - status
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  status:
     *                      type: string
     *                      example: status
     *          responses:
     *              '201':
     *                  description: A menu object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateMenuStatus (ctx: DefaultContext) {
        const reqData = ctx.request.body
        const id = +reqData.id
        const status = reqData.status

        try {
            const sendBack = await Menu.updateItem({ id: id, status: status })
            ctx.body = sendBack
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /menu:
     *      delete:
     *          tags:
     *              - Menu
     *          summary: Delete a menu.
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
     *              name: menu
     *              description: The menu to delete.
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
     *                  description: Menu has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async deleteMenu (ctx: DefaultContext) {
        const { id } = ctx.request.body

        try {
            await Menu.destroyItem(id)
            ctx.body = 'Deleted'
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}

export default MenuController
