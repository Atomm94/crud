// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Social } from '../model/entity/index'

class SocialController {
    /**
 *
 * @swagger
 * /social:
 *      get:
 *          tags:
 *              - Social
 *          summary: Return Social list
 *          parameters:
 *              - in: header
 *                name: Authorization
 *                required: true
 *                description: Authentication token
 *                schema:
 *                    type: string
 *          responses:
 *              '200':
 *                  description: Array of social
 *              '401':
 *                  description: Unauthorized
 */

    public static async getSocialLink (ctx: DefaultContext) {
        let social

        try {
            social = await Social.getAllItems(ctx.query)
            ctx.body = social
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /social:
     *      post:
     *          tags:
     *              - Social
     *          summary: Create socials.
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
     *              term: time
     *              translations: translations
     *              schema:
     *                type: object
     *                required:
     *                  - title
     *                  - url
     *                  - class
     *                  - icon_class
     *                properties:
     *                  title:
     *                      type: varchar
     *                      example: "title"
     *                  url:
     *                      type: json
     *                      example: "url"
     *                  class:
     *                      type: json
     *                      example: "class"
     *                  icon_class:
     *                      type: json
     *                      example: "icon_class"
     *          responses:
     *              '201':
     *                  description: A social object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createSocialLink (ctx: DefaultContext) {
        const body = ctx.request.body
        try {
            const socialLink = await Social.addItem(body)
            ctx.body = socialLink
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
    /**
          *
          * @swagger
          *  /social:
          *      put:
          *          tags:
          *              - Social
          *          summary: Update socials.
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
          *              id : id
          *              title: "title"
          *              url: "url"
          *              class: "class"
          *              icon_class: "icon_class"
          *              description: For change Socials.
          *              schema:
          *                type: object
          *                required:
          *                  - id
          *                properties:
          *                  id:
          *                      type: number
          *                  translations:
          *                      type: json
          *                example:
          *                    {
          *                         id: 1,
          *                         title: "my_name",
          *                         url: "my_url",
          *                         class: "my_class",
          *                         icon_class: "my_icon_class"
          *                    }
          *          responses:
          *              '200':
          *                  description: Ok
          *              '201':
          *                  description: A social updated object
          *              '409':
          *                  description: Conflict
          *              '422':
          *                  description: Wrong data
          */

    public static async updateSocialLink (ctx: DefaultContext) {
        const body = ctx.request.body
        try {
            const updatedSocialLink = await Social.updateItem(body)
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
      *  /social:
      *      delete:
      *          tags:
      *              - Social
      *          summary: Delete Social.
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
      *              id: id
      *              description: For delete Translations.
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
      *                  description: Social has been deleted
      *              '409':
      *                  description: Conflict
      *              '422':
      *                  description: Wrong data
      */
    public static async deleteSocialLink (ctx: DefaultContext) {
        const { id } = ctx.request.body

        try {
            await Social.destroyItem(id)
            ctx.body = 'Deleted'
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}

export default SocialController
