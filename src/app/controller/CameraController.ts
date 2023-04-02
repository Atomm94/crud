import { DefaultContext } from 'koa'
import { Camera } from '../model/entity/Camera'
export default class CameraController {
    /**
     *
     * @swagger
     *  /camera:
     *      post:
     *          tags:
     *              - Camera
     *          summary: Creates a camera.
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
     *              name: camera
     *              description: The camera to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  service_id:
     *                      type: number
     *                  service_name:
     *                      type: string
     *                  name:
     *                      type: string
     *                  channel_type:
     *                      type: number
     *                  status:
     *                      type: number
     *                  stream_nums:
     *                      type: number
     *                  device_type:
     *                      type: number
     *                  allow_distribution:
     *                      type: number
     *                  add_type:
     *                      type: number
     *                  access_protocol:
     *                      type: number
     *                  off_reason:
     *                      type: number
     *                  remote_index:
     *                      type: number
     *                  manufacturer:
     *                      type: string
     *                  device_model:
     *                      type: string
     *                  gbid:
     *                      type: string
     *                  address_info:
     *                      type: string
     *                  is_poe_port:
     *                      type: number
     *                  poe_status:
     *                      type: number
     *                  company:
     *                      type: number
     *          responses:
     *              '201':
     *                  description: A camera object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await Camera.addItem(ctx.request.body as Camera)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera:
     *      put:
     *          tags:
     *              - Camera
     *          summary: Update a camera.
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
     *              name: camera
     *              description: The camera to create.
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
     *                      example: 'IP Camera 01'
     *                  hidden:
     *                      type: boolean
     *                      example: false
     *          responses:
     *              '201':
     *                  description: A camera updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            const where = { id: req_data.id, company: user.company ? user.company : null }
            const check_by_company: any = await Camera.findOne({ where })

            if (!check_by_company) {
                ctx.status = 400
                return ctx.body = { message: 'something went wrong' }
            }
            ctx.body = await Camera.updateItem(ctx.request.body as Camera)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /camera/{id}:
     *      get:
     *          tags:
     *              - Camera
     *          summary: Return camera by ID
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
            ctx.body = await Camera.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera:
     *      delete:
     *          tags:
     *              - Camera
     *          summary: Delete a camera.
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
     *              name: camera
     *              description: The camera to create.
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
     *                  description: camera has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await Camera.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /camera:
     *      get:
     *          tags:
     *              - Camera
     *          summary: Return camera list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: camera_device
     *                description: id of Camera Device
     *                required : false
     *                schema:
     *                    type: number
     *              - in: query
     *                name: hidden
     *                description: show hiddens
     *                required : false
     *                schema:
     *                    type: boolean
     *          responses:
     *              '200':
     *                  description: Array of camera
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            const user = ctx.user
            const where: any = { company: { '=': user.company ? user.company : null } }
            if ('camera_device' in req_data) where.camera_device = req_data.camera_device
            if ('hidden' in req_data) where.hidden = req_data.hidden
            req_data.where = where
            ctx.body = await Camera.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
