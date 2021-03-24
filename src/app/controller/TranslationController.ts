// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Translation } from '../model/entity/index'
import { logger } from '../../../modules/winston/logger'

class TranslationController {
    /**
     *
     * @swagger
     * /translations:
     *      get:
     *          tags:
     *              - Translations
     *          summary: Return Translations list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of translations
     *              '401':
     *                  description: Unauthorized
     */

    public static async getTrans (ctx: DefaultContext) {
        let trans

        try {
            trans = await Translation.getAllItems(ctx.query)
            return ctx.body = trans
        } catch (error) {
            return ctx.body = error
        }
    }

    /**
        *
        * @swagger
        *  /translations:
        *      post:
        *          tags:
        *              - Translations
        *          summary: Create a translations.
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
        *                  - term
        *                  - translations
        *                properties:
        *                  term:
        *                      type: varchar
        *                      example: "2020-12-31"
        *                  translations:
        *                      type: json
        *                      example: "en,ru,arm"
        *          responses:
        *              '201':
        *                  description: A translations object
        *              '409':
        *                  description: Conflict
        *              '422':
        *                  description: Wrong data
        */
    public static async createTrans (ctx: DefaultContext) {
        const body = ctx.request.body
        try {
            const trans = await Translation.addItem(body)
            ctx.body = trans
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
       *
       * @swagger
       *  /translations:
       *      put:
       *          tags:
       *              - Translations
       *          summary: Update translations.
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
       *              translations: "fr,ge,au"
       *              description: For change Translations.
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
       *                         translations: "fr,ge,au",
       *                    }
       *          responses:
       *              '201':
       *                  description: translations updated object
       *              '409':
       *                  description: Conflict
       *              '422':
       *                  description: Wrong data
       */

    public static async updateTrans (ctx: DefaultContext) {
        const body = ctx.request.body
        try {
            const updated = await Translation.updateItem(body)
            ctx.oldData = updated.old
            ctx.body = updated.new
        } catch (error) {
            logger.info(error.message)
            ctx.status = error.statusCode || 409
            return ctx.body = {
                statusCode: error.statusCode || 409,
                code: error.code,
                message: error.message
            }
        }
        return ctx
    }

    /**
 *
 * @swagger
 *  /translations:
 *      delete:
 *          tags:
 *              - Translations
 *          summary: Delete Translations.
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
 *                  description: Translation has been deleted
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */

    public static async deleteTrans (ctx: DefaultContext) {
        const req_data = ctx.request.body
        const where = { id: req_data.id }
        try {
            await Translation.destroyItem(where)
            return ctx.body = 'Deleted'
        } catch (error) {
            return ctx.body = error
        }
    }
}

export default TranslationController
