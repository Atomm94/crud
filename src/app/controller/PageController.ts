// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { Page } from '../model/entity/index'
import fs from 'fs'
import { logger } from '../../../modules/winston/logger'
import { join } from 'path'
const parentDir = join(__dirname, '../..')

if (!fs.existsSync(`${parentDir}/public/`)) {
    logger.info('!!!exists')
    fs.mkdirSync(`${parentDir}/public`)
}

class PageController {
    /**
     *
     * @swagger
     * /page:
     *      get:
     *          tags:
     *              - Page
     *          summary: Return page list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of page
     *              '401':
     *                  description: Unauthorized
     */
    public static async getPage (ctx: DefaultContext) {
        try {
            // const page = await Page.getAllItems(ctx.query)
            const page = await Page.createQueryBuilder('page')
                .select(['page', 'sections'])
                .leftJoin('page.sections', 'sections')
                .getMany()
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
     * page/{pageId}:
     *      get:
     *          tags:
     *              - Page
     *          summary: Return page by ID
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
     *                description: Page Id
     *                schema:
     *                    type: integer
     *                    minimum: 1
     *          responses:
     *              '200':
     *                  description: OK
     *              '401':
     *                  description: Unauthorized
     */
    public static async getPageById (ctx: DefaultContext) {
        const id = ctx.params.pageId
        let page

        try {
            page = await Page.createQueryBuilder('page')
                .select(['page', 'sections'])
                .where('page.id = :id', { id: id })
                .leftJoin('page.sections', 'sections')
                .getMany()
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
     *  /page:
     *      post:
     *          tags:
     *              - Page
     *          summary: Create a page.
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
     *              name: page
     *              description: The page to create.
     *              schema:
     *                type: object
     *                required:
     *                  - title
     *                  - body
     *                  - url
     *                  - summary
     *                  - published
     *                  - meta_title
     *                  - meta_keywords
     *                  - status
     *                  - files
     *                  - image
     *                properties:
     *                  title:
     *                      type: string
     *                      example: title
     *                  body:
     *                      type: string
     *                      example: body
     *                  url:
     *                      type: string
     *                      example: url
     *                  summary:
     *                      type: string
     *                      example: summary
     *                  published:
     *                      type: string
     *                      example: published
     *                  meta_title:
     *                      type: string
     *                      example: meta_title
     *                  meta_keywords:
     *                      type: string
     *                      example: meta_keywords
     *                  status:
     *                      type: string
     *                      example: status
     *                  files:
     *                      type: string
     *                      example: files
     *                  image:
     *                      type: string
     *                      example: image
     *          responses:
     *              '201':
     *                  description: A page object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createPage (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const createPage = await Page.addItem(reqData)
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
     *  /page:
     *      put:
     *          tags:
     *              - Page
     *          summary: Create a page.
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
     *              name: page
     *              description: The page to create.
     *              schema:
     *                type: object
     *                required:
     *                  - title
     *                  - body
     *                  - url
     *                  - summary
     *                  - published
     *                  - meta_title
     *                  - meta_keywords
     *                  - status
     *                  - files
     *                  - image
     *                properties:
     *                  title:
     *                      type: string
     *                      example: title
     *                  body:
     *                      type: string
     *                      example: body
     *                  url:
     *                      type: string
     *                      example: url
     *                  summary:
     *                      type: string
     *                      example: summary
     *                  published:
     *                      type: string
     *                      example: published
     *                  meta_title:
     *                      type: string
     *                      example: meta_title
     *                  meta_keywords:
     *                      type: string
     *                      example: meta_keywords
     *                  status:
     *                      type: string
     *                      example: status
     *                  files:
     *                      type: string
     *                      example: files
     *                  image:
     *                      type: string
     *                      example: image
     *          responses:
     *              '201':
     *                  description: A page object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updatePage (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const updatedPage = await Page.updateItem(reqData)

            ctx.body = updatedPage
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /updatePageStatus:
     *      post:
     *          tags:
     *              - Page
     *          summary: Update a page status.
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
     *              name: page status
     *              description: The page status to update.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                  - status
     *                properties:
     *                  id:
     *                      type: number
     *                      example: id
     *                  status:
     *                      type: string
     *                      example: status
     *          responses:
     *              '201':
     *                  description: A page object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async updatePageStatus (ctx: DefaultContext) {
        const reqData = ctx.request.body
        try {
            const sendBack = await Page.updateItem({ id: +reqData.id, status: reqData.status })
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
     *  /page:
     *      delete:
     *          tags:
     *              - Page
     *          summary: Delete a page.
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
     *              name: page
     *              description: The page to delete.
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
     *                  description: Page has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async deletePage (ctx: DefaultContext) {
        const { id } = ctx.request.body
        try {
            await Page.destroyItem(id)
            ctx.body = 'Deleted'
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}

export default PageController
