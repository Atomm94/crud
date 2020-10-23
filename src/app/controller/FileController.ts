// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { fileSave } from '../functions/file'
// import { getRepository /* Connection */ } from 'typeorm'
// import { Page, Section } from '../model/entity/index'
import fs from 'fs'
import { logger } from '../../../modules/winston/logger'
import { join } from 'path'
const parentDir = join(__dirname, '../..')

if (!fs.existsSync(`${parentDir}/public/`)) {
    logger.info('!!!exists')
    fs.mkdirSync(`${parentDir}/public`)
}

class FileController {
    /**
     *
     * @swagger
     *  /upload:
     *      post:
     *          tags:
     *              - File
     *          summary: Upload file.
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
     *              description: The upload file.
     *          responses:
     *              '201':
     *                  description: file upload
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async saveFile (ctx: DefaultContext) {
        const file = ctx.request.files.file
        const savedFile = fileSave(file)
        return ctx.body = savedFile
    }

    /**
     *
     * @swagger
     *  /upload:
     *      delete:
     *          tags:
     *              - File
     *          summary: Delete a file.
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
     *              description: The file name to delete.
     *              schema:
     *                type: string
     *                required:
     *                  - name
     *                properties:
     *                  name:
     *                      type: string
     *          responses:
     *              '200':
     *                  description: File has been deleted
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async deleteFile (ctx: DefaultContext) {
        const name = ctx.request.body.name

        try {
            fs.unlink(`${parentDir}/public/${name}`, (err) => {
                if (err) throw err

                logger.info('Delete complete!')
            })
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

export default FileController
