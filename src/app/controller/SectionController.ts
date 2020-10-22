import { DefaultContext } from 'koa'
import { Section } from '../model/entity/Section'
export default class SectionController {
    /**
     *
     * @swagger
     * section/{id}:
     *      get:
     *          tags:
     *              - Section
     *          summary: Return section by ID
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
     *                description: Section Id
     *                schema:
     *                    type: integer
     *                    minimum: 1
     *          responses:
     *              '200':
     *                  description: OK
     *              '401':
     *                  description: Unauthorized
     */
    public static async getSectionById (ctx: DefaultContext) {
        let page
        const id = ctx.params.id

        try {
            page = await Section.getItem(id)
            ctx.body = page
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /createSection:
     *      post:
     *          tags:
     *              - Section
     *          summary: Create a section.
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
     *              name: section
     *              description: The section to create.
     *              schema:
     *                type: object
     *                required:
     *                  - title
     *                  - body
     *                  - published
     *                  - slug
     *                  - id
     *                  - image
     *                  - files
     *                properties:
     *                  title:
     *                      type: string
     *                      example: title
     *                  body:
     *                      type: string
     *                      example: body
     *                  published:
     *                      type: string
     *                      example: published
     *                  slug:
     *                      type: string
     *                      example: slug
     *                  id:
     *                      type: number
     *                      example: 1
     *                  image:
     *                      type: string
     *                      example: image
     *                  files:
     *                      type: string
     *                      example: files
     *          responses:
     *              '201':
     *                  description: A section object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createSection (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const createPage = await Section.addItem(reqData)
            ctx.body = createPage
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /updateSection:
     *      post:
     *          tags:
     *              - Section
     *          summary: Update a section.
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
     *              name: section
     *              description: The section to update.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                  - title
     *                  - body
     *                  - slug
     *                  - published
     *                  - files
     *                  - image
     *                properties:
     *                  id:
     *                      type: number
     *                      example: id
     *                  title:
     *                      type: string
     *                      example: title
     *                  body:
     *                      type: string
     *                      example: body
     *                  slug:
     *                      type: string
     *                      example: slug
     *                  published:
     *                      type: number
     *                      example: published
     *                  files:
     *                      type: string
     *                      example: files
     *                  image:
     *                      type: string
     *                      example: image
     *          responses:
     *              '201':
     *                  description: A section object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updateSection (ctx: DefaultContext) {
        const reqData = ctx.request.body
        const id = +reqData.id

        let createPage

        try {
            createPage = await Section.findOneOrFail(id)

            if ('title' in reqData) createPage.title = reqData.title ? reqData.title : null
            if ('body' in reqData) createPage.body = reqData.body ? reqData.body : null
            if ('slug' in reqData) createPage.slug = reqData.slug ? reqData.slug : null
            if ('published' in reqData) createPage.published = reqData.published ? reqData.published : null
            if ('files' in reqData) createPage.files = reqData.files && reqData.files.length ? reqData.files : []
            if ('image' in reqData) createPage.image = reqData.image ? reqData.image : null
            if ('status' in reqData) createPage.status = reqData.status
            if ('priority' in reqData) createPage.priority = reqData.priority ? reqData.priority : 1

            const sendChanges = await Section.save(createPage)

            ctx.body = sendChanges
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /section:
     *      delete:
     *          tags:
     *              - Section
     *          summary: Delete a section.
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
     *              name: section
     *              description: The section to delete.
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
     *                  description: Section has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async deleteSection (ctx: DefaultContext) {
        const { id } = ctx.request.body

        try {
            await Section.destroyItem(id)
            ctx.body = 'Deleted'
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
