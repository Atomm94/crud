import { DefaultContext } from 'koa'
import { updateZohoConfig } from '../functions/update-zoho-config'
import { Zoho } from '../model/entity/Zoho'

export default class ZohoController {
    /**
     *
     * @swagger
     *  /zoho:
     *      post:
     *          tags:
     *              - Zoho
     *          summary: Creates a zoho.
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
     *              name: zoho
     *              description: The zoho to create.
     *              schema:
     *                  type: object
     *                  required:
     *                  properties:
     *                      client_id:
     *                          type: string
     *                          example: 1000.2075EZN43T60KMTNR1LEGY7SK63SNJ
     *                      client_secret:
     *                          type: string
     *                          example: 93e9d3a0f98085437bc1a0d61fe87ad02a797c30fe
     *                      code:
     *                          type: string
     *                          example: 1000.44563828ced176c0566d2d99757a0663.ad40e23c753d2f65ca5327d12db7a34b
     *                      scope:
     *                          type: string
     *                          example: ZohoCRM.modules.ALL
     *                      redirect_uri:
     *                          type: string
     *                          example: https://unimacs.studio-one.am/zoho
     *          responses:
     *              '201':
     *                  description: A zoho object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user

            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            const zoho = await Zoho.addItem(req_data as Zoho)
            ctx.body = zoho
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /zoho:
     *      put:
     *          tags:
     *              - Zoho
     *          summary: Update a zoho.
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
     *              name: zoho
     *              description: The zoho to create.
     *              schema:
     *                  type: object
     *                  required:
     *                    - id
     *                  properties:
     *                      id:
     *                          type: number
     *                          example: 1
     *                          client_id:
     *                              type: string
     *                              example: 1000.2075EZN43T60KMTNR1LEGY7SK63SNJ
     *                          client_secret:
     *                              type: string
     *                              example: 93e9d3a0f98085437bc1a0d61fe87ad02a797c30fe
     *                          code:
     *                              type: string
     *                              example: 1000.44563828ced176c0566d2d99757a0663.ad40e23c753d2f65ca5327d12db7a34b
     *                          scope:
     *                              type: string
     *                              example: ZohoCRM.modules.ALL
     *                          redirect_uri:
     *                              type: string
     *                              example: https://unimacs.studio-one.am
     *          responses:
     *              '201':
     *                  description: A zoho updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user

            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            const updated = await Zoho.updateItem(req_data as Zoho)
            await updateZohoConfig()
            ctx.oldData = updated.old
            ctx.body = updated.new
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
     * /zoho/{id}:
     *      get:
     *          tags:
     *              - Zoho
     *          summary: Return zoho by ID
     *          parameters:
     *              - name: id
     *                in: path
     *                required: true
     *                description: Parameter description
     *                schema:
     *                    type: integer
     *                    format: int64
     *                    minimum: 1
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async get (ctx: DefaultContext) {
        try {
            const user = ctx.user
            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }
            ctx.body = await Zoho.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /zoho:
     *      delete:
     *          tags:
     *              - Zoho
     *          summary: Delete a zoho.
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
     *              name: zoho
     *              description: The zoho to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *          responses:
     *              '200':
     *                  description: zoho has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const user = ctx.user
            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            const where = { id: req_data.id, company: user.company ? user.company : null }
            ctx.body = await Zoho.destroyItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /zoho:
     *      get:
     *          tags:
     *              - Zoho
     *          summary: Return zoho list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of zoho
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const user = ctx.user
            if (user.company) {
                ctx.status = 400
                return ctx.body = { message: 'Permission denied' }
            }

            ctx.body = await Zoho.getAllItems({})
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /zoho/code:
     *      get:
     *          tags:
     *              - Zoho
     *          summary: Return zoho by ID
     *          parameters:
     *              - in: query
     *                name: code
     *                description: code of zoho
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async getCodeOfZoho (ctx: DefaultContext) {
        try {
            const code = ctx.query.code
            if (code) {
                console.log(code)
                const zoho = await Zoho.findOne()
                if (zoho) {
                    zoho.code = code
                    await zoho.save()

                    await updateZohoConfig()
                }
            }
            ctx.body = { success: true }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
