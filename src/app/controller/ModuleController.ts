// import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import {
    // Role,
    Module
} from '../model/entity/index'
// import fs from 'fs'
// import { join } from 'path'
import { logger } from '../../../modules/winston/logger'

// const parentDir = join(__dirname, '..')

class ModuleController {
    /**
     *
     * @swagger
     * /module:
     *      get:
     *          tags:
     *              - Module
     *          summary: Return module json
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Module json
     *              '401':
     *                  description: Unauthorized
     */
    public static async getModule (ctx: DefaultContext) {
        const moduleData: any = Module.getModule()
        return ctx.body = moduleData
    }

    /**
     *
     * @swagger
     * /findModule:
     *      get:
     *          tags:
     *              - Module
     *          summary: Return parsed module data
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Parsed module data
     *              '401':
     *                  description: Unauthorized
     */
    public static async findModule (ctx: DefaultContext) {
        const parsedModule: any = Module.findModule()

        // let role
        // let permissions: any
        try {
            if (ctx.user && ctx.user.role) {
                // role = await Role.findOne({ id: ctx.user.role })
                // permissions = role?.permissions
                // if (role && !permissions.super) {
                //     Object.keys(parsedModule).forEach((m) => {
                //         if (!parsedModule[m].submenu) {
                //             logger.info('parsedModule ' + JSON.stringify(parsedModule))
                //             if (!permissions.modules[m].read) {
                //                 delete parsedModule[m]
                //             }
                //         } else if (parsedModule[m].submenu) {
                //             Object.keys(parsedModule[m].submenu).forEach((sub) => {
                //                 if (!permissions.modules[sub].read) {
                //                     delete parsedModule[m].submenu[sub]
                //                 }
                //             })
                //         }
                //     })
                // } else {
                //     ctx.body = parsedModule
                // }
            }
            ctx.body = parsedModule
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /getSelections/{name}:
     *      get:
     *          tags:
     *              - Module
     *          summary: get module selections
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: path
     *                name: name
     *                required: true
     *                description: Module Name
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Module selections
     *              '401':
     *                  description: Unauthorized
     */
    public static async getModuleSelections (ctx: DefaultContext) {
        const name = ctx.params.name

        const data: any = Module.getModuleSelections()

        const body = data[name]

        return ctx.body = body
    }

    /**
     *
     * @swagger
     *  /createModuleData:
     *      post:
     *          tags:
     *              - Module
     *          summary: Create module data.
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
     *              name: upload
     *              type: file
     *              description: The upload file.
     *          responses:
     *              '201':
     *                  description: module data
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createModuleData (ctx: DefaultContext) {
        const body = ctx.request.body
        const image = ctx.request.files.upload
        logger.info('body ' + (body))
        logger.info(image)

        const send = Module.createModuleData()

        return ctx.body = send
    }
}

export default ModuleController
