import { CameraIntegration } from '../cameraIntegration/deviceFactory'
import { cameraApiCodes } from '../cameraIntegration/enums/cameraApiCodes.enum'
import { Camera } from '../model/entity/Camera'
import { CameraDevice } from '../model/entity/CameraDevice'
import { CameraSet } from './../model/entity/CameraSet'
import { DefaultContext } from 'koa'

export default class CameraSetController {
    /**
     *
     * @swagger
     *  /camera-set:
     *      post:
     *          tags:
     *              - Camera-set
     *          summary: Creates a new camera set instance.
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
     *              name: camera set
     *              description: The camera set to create.
     *              schema:
     *                type: object
     *                required:
     *                  - name
     *                  - before_event
     *                  - after_event
     *                  - access_point
     *                properties:
     *                  name:
     *                      type: string
     *                      example: mySet
     *                  before_event:
     *                      type: number
     *                      example: 5
     *                  after_event:
     *                      type: number
     *                      example: 15
     *                  access_point:
     *                      type: number
     *                      example: 23
     *          responses:
     *              '201':
     *                  description: The new camera set object
     *              '400':
     *                  description: Unhandled server error
     */
    public static async add (ctx: DefaultContext) {
        const cameraSet = ctx.request.body
        const company = ctx.user.company
        cameraSet.company = company
        try {
            const newCameraSet = await CameraSet.addItem({ ...cameraSet })

            ctx.status = 200
            ctx.body = newCameraSet
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-set:
     *      put:
     *          tags:
     *              - Camera-set
     *          summary: Updates the camera set.
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
     *              name: camera set
     *              description: The camera set to update.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  name:
     *                      type: string
     *                      example: mySet
     *                  before_event:
     *                      type: number
     *                      example: 5
     *                  after_event:
     *                      type: number
     *                      example: 15
     *                  access_point:
     *                      type: number
     *                      example: 23
     *                  camera_ids:
     *                      type: Array<number>
     *                      example: [1, 2]
     *          responses:
     *              '200':
     *                  description: The updated camera set object
     *              '400':
     *                  description: Unhandled server error
     */

    public static async update (ctx: DefaultContext) {
        const cameraSet = ctx.request.body
        try {
            if (cameraSet.camera_ids.length > 4) {
                 ctx.status = 400
                 return ctx.body = {
                    message: 'Max count of cameras is 4 in Set'
                }
            }
            const cameraSetUpdated = await CameraSet.updateItem(cameraSet)
            ctx.body = {
                message: 'Set updated successfully',
                data: cameraSetUpdated.new
            }
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-set:
     *      get:
     *          tags:
     *              - Camera-set
     *          summary: Returns the company camera sets.
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *          responses:
     *              '200':
     *                  description: The company camera set list
     *              '400':
     *                  description: Unhandled server error
     */

    public static async getAll (ctx: DefaultContext) {
        const { company } = ctx.user
        console.log(company)
        try {
            const cameraSets = await CameraSet.find({ company })
            ctx.body = cameraSets
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-set/{id}:
     *      delete:
     *          tags:
     *              - Camera-set
     *          summary: Deletes the set by id.
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *            - in: path
     *              name: The camera set id
     *              required: true
     *              type: string
     *          responses:
     *              '200':
     *                  description: Deletion message
     *              '400':
     *                  description: Unhandled server error
     */

    public static async destroy (ctx: DefaultContext) {
        try {
            const { id } = ctx.params
            const user = ctx.user
            const where = { id: id, company: user.company ? user.company : null }
            ctx.body = await CameraSet.destroyItem(where)
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /camera-set/{id}:
     *      get:
     *          tags:
     *              - Camera-set
     *          summary: Returns camera set object by id.
     *          parameters:
     *            - in: header
     *              name: Authorization
     *              required: true
     *              description: Authentication token
     *              schema:
     *                type: string
     *            - in: path
     *              name: The camera set id
     *              required: true
     *              type: string
     *          responses:
     *              '200':
     *                  description: The camera set object
     *              '400':
     *                  description: Unhandled server error
     */

    public static async get (ctx: DefaultContext) {
        const { id } = ctx.params
        const { company } = ctx.user

        try {
            const cameraSet = await CameraSet.findOneOrFail({ id, company })
            ctx.body = cameraSet
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }

    /**
   *
   * @swagger
   *  /camera-set/livestream/{id}:
   *      get:
   *          tags:
   *              - Camera-device
   *          summary: Returns a camera device by id.
   *          consumes:
   *              - application/json
   *          parameters:
   *            - name: id
   *              in: path
   *              required: true
   *              description: Parameter description
   *              schema:
   *                  type: integer
   *                  format: int64
   *                  minimum: 1
   *            - in: header
   *              name: Authorization
   *              required: true
   *              description: Authentication token
   *              schema:
   *                type: string
   *          responses:
   *              '200':
   *                  description: Camera device object
   *              '400':
   *                  description: Some server error with description message
   */

    public static async getLivestream (ctx: DefaultContext) {
        const { id } = ctx.params
        try {
            const camera = await Camera.findOneOrFail({ where: { id, company: ctx.user.company } })
            const device = await CameraDevice.findOneOrFail({ where: { id: camera.camera_device } })
            const livestream_url = await new CameraIntegration().deviceFactory(device, cameraApiCodes.LIVESTREAM)
            ctx.body = { url: livestream_url }
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }
}
