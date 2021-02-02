import { DefaultContext } from 'koa'
import { CompanyDocuments } from '../model/entity/CompanyDocuments'
export default class CompanyDocumentsController {
    /**
     *
     * @swagger
     *  /company/document:
     *      post:
     *          tags:
     *              - CompanyDocuments
     *          summary: Creates a companyDocuments.
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
     *              name: companyDocuments
     *              description: The companyDocuments to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  date:
     *                      type: string
     *                  company:
     *                      type: number
     *                  file:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A companyDocuments object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await CompanyDocuments.addItem(ctx.request.body as CompanyDocuments)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /company/document:
     *      put:
     *          tags:
     *              - CompanyDocuments
     *          summary: Update a companyDocuments.
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
     *              name: companyDocuments
     *              description: The companyDocuments to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  name:
     *                      type: string
     *                  date:
     *                      type: string
     *                  company:
     *                      type: number
     *                  file:
     *                      type: string
     *          responses:
     *              '201':
     *                  description: A companyDocuments updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const updated = await CompanyDocuments.updateItem(ctx.request.body as CompanyDocuments)
            ctx.oldData = updated.old
            ctx.body = updated.new
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /company/document/{id}:
     *      get:
     *          tags:
     *              - CompanyDocuments
     *          summary: Return companyDocuments by ID
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
            ctx.body = await CompanyDocuments.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /company/document:
     *      delete:
     *          tags:
     *              - CompanyDocuments
     *          summary: Delete a companyDocuments.
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
     *              name: companyDocuments
     *              description: The companyDocuments to create.
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
     *                  description: companyDocuments has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await CompanyDocuments.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /company/document:
     *      get:
     *          tags:
     *              - CompanyDocuments
     *          summary: Return companyDocuments list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of companyDocuments
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await CompanyDocuments.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /company/document/file:
     *      post:
     *          tags:
     *              - CompanyDocuments
     *          summary: Upload Company file.
     *          consumes:
     *              - multipart/form-data
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                    type: string
     *            - in: formData
     *              name: file
     *              type: file
     *              description: The upload company file.
     *          responses:
     *              '201':
     *                  description: file upload
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async companyFileUpload (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = await CompanyDocuments.saveFile(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /company/document/file:
     *      delete:
     *          tags:
     *              - CompanyDocuments
     *          summary: Delete a Company file.
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
     *              name: file
     *              description: The company file name to delete.
     *              schema:
     *                type: string
     *                required:
     *                  - name
     *                properties:
     *                  name:
     *                      type: string
     *          responses:
     *              '200':
     *                  description: Company file has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async companyFileDelete (ctx: DefaultContext) {
        const name = ctx.request.body.name

        try {
            CompanyDocuments.deleteFile(name)
            ctx.body = {
                success: true
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
