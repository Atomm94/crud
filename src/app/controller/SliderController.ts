// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Slider } from '../model/entity/index'

class SliderController {
    /**
*
* @swagger
* /slider:
*      get:
*          tags:
*              - Slider
*          summary: Return Slider list
*          parameters:
*              - in: header
*                name: Authorization
*                required: true
*                description: Authentication token
*                schema:
*                    type: string
*          responses:
*              '200':
*                  description: Array of slider
*              '401':
*                  description: Unauthorized
*/

    public static async getSlider (ctx: DefaultContext) {
        let slider

        try {
            slider = await Slider.getAllItems(ctx.query)
            ctx.body = slider
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
         *
         * @swagger
         *  /slider:
         *      post:
         *          tags:
         *              - Slider
         *          summary: Create Slider.
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
         *                  - description
         *                  - photo
         *                  - status
         *                properties:
         *                  title:
         *                      type: string
         *                      example: "title"
         *                  url:
         *                      type: json
         *                      example: "url"
         *                  description:
         *                      type: json
         *                      example: "description"
         *                  photo:
         *                      type: json
         *                      example: "photo"
         *                  status:
         *                      type: boolean
         *                      example: true
         *          responses:
         *              '201':
         *                  description: A sliders object
         *              '409':
         *                  description: Conflict
         *              '422':
         *                  description: Wrong data
         */
    public static async createSlider (ctx: DefaultContext) {
        const reqData = ctx.request.body

        try {
            const saveSlider = await Slider.addItem(reqData)
            ctx.body = saveSlider
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
       *
       * @swagger
       *  /slider:
       *      put:
       *          tags:
       *              - Slider
       *          summary: Update Slider.
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
       *              description: "description"
       *              status: "status"
       *              photo: "photo"
       *              schema:
       *                type: object
       *                required:
       *                  - id
       *                properties:
       *                  id:
       *                      type: number
       *                  title:
       *                      type: json
       *                  url:
       *                      type: json
       *                  description:
       *                      type: json
       *                  photo:
       *                      type: json
       *                example:
       *                    {
       *                         id: 1,
       *                         title: "my_name",
       *                         url: "my_url",
       *                         description: "my_description",
       *                         status: true,
       *                         photo: "my_photo",
       *                    }
       *          responses:
       *              '201':
       *                  description: A slider updated object
       *              '409':
       *                  description: Conflict
       *              '422':
       *                  description: Wrong data
       */
    public static async updateSlider (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const updatedSlider = await Slider.updateItem(reqData)
            ctx.body = updatedSlider
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
    *
    * @swagger
    *  /slider:
    *      delete:
    *          tags:
    *              - Slider
    *          summary: Delete Slider.
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
    *              description: For delete Slider
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
    *                  description: Slider has been deleted
    *              '409':
    *                  description: Conflict
    *              '422':
    *                  description: Wrong data
    */
    public static async deleteSlider (ctx: DefaultContext) {
        const { id } = ctx.request.body

        try {
            await Slider.destroyItem(id)
            ctx.body = 'Deleted'
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}

export default SliderController
