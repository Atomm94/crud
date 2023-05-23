import { In, Not } from 'typeorm'
import { CameraIntegration } from '../cameraIntegration/deviceFactory'
import { cameraApiCodes } from '../cameraIntegration/enums/cameraApiCodes.enum'
import { Camera } from '../model/entity/Camera'
import { CameraDevice } from '../model/entity/CameraDevice'
import { CameraSetToCamera } from '../model/entity/CameraSetToCamera'
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
     *                  id:
     *                      type: number
     *                      example: 1
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
     *                  cameras:
     *                      type: array
     *                      items:
     *                          type: object
     *                          properties:
     *                              id:
     *                                  type: number
     *                                  example: 1
     *                              main:
     *                                  type: boolean
     *                                  example: true
     *          responses:
     *              '200':
     *                  description: The updated camera set object
     *              '400':
     *                  description: Unhandled server error
     */

    public static async update (ctx: DefaultContext) {
        try {
            const req_data = ctx.request.body
            const user = ctx.user
            req_data.company = user.company ? user.company : null
            const cameras = req_data.cameras
            if (cameras) {
                if (cameras.length > 4) {
                    ctx.status = 400
                    return ctx.body = {
                        message: 'Max count of cameras is 4 in Set'
                    }
                }
                let main_qty = 0
                for (const camera of cameras) {
                    if (camera.main) main_qty++
                    if (main_qty > 1) {
                        ctx.status = 400
                        return ctx.body = {
                            message: 'Main Camera must be one'
                        }
                    }
                }
                if (!main_qty && cameras.length) cameras[0].main = true
                // cameras = req_data.camera_ids.map((camera_id: number) => { return { id: camera_id } })
            }
            const cameraSetUpdated = await CameraSet.updateItem(req_data)
            if (cameras) {
                const camera_ids = []
                for (const camera of cameras) {
                    const camera_set_to_camera = await CameraSetToCamera.findOne({ where: { camera_set_id: req_data.id, camera_id: camera.id } })
                    if (!camera_set_to_camera) {
                        await CameraSetToCamera.addItem({ camera_set_id: req_data.id, camera_id: camera.id, main: camera.main } as CameraSetToCamera)
                    } else {
                        await CameraSetToCamera.updateItem({ id: camera_set_to_camera.id, main: camera.main } as CameraSetToCamera)
                    }
                    camera_ids.push(camera.id)
                }
                const remove_where: { [key: string]: any } = { camera_set_id: req_data.id }
                if (camera_ids.length) remove_where.camera_id = Not(In(camera_ids))
                await CameraSetToCamera.remove(await CameraSetToCamera.find({ where: remove_where }))
            }
            ctx.body = cameraSetUpdated.new
        } catch (err) {
            console.log(65635, err)

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
        try {
            const user = ctx.user
            const company = user.company ? user.company : null
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
     *              name: id
     *              required: true
     *              description: Parameter description
     *              schema:
     *                  type: integer
     *                  format: int64
     *                  minimum: 1
     *          responses:
     *              '200':
     *                  description: The camera set object
     *              '400':
     *                  description: Unhandled server error
     */

    public static async get (ctx: DefaultContext) {
        try {
            const { id } = ctx.params
            const user = ctx.user
            const cameraSet: any = await CameraSet.createQueryBuilder('camera_set')
                .addSelect(['camera_set_camera.main'])
                .leftJoinAndSelect('camera_set.access_points', 'access_point', 'access_point.delete_date is null')
                .leftJoin('camera_set.camera_set_cameras', 'camera_set_camera')
                .leftJoinAndSelect('camera_set_camera.cameras', 'camera', 'camera.delete_date is null')
                .leftJoinAndSelect('camera.camera_devices', 'camera_device', 'camera_device.delete_date is null')
                .where(`camera_set.id = '${id}'`)
                .andWhere(`camera_set.company = '${user.company ? user.company : null}'`)
                .getOne()

            if (!cameraSet) {
                ctx.status = 400
                return ctx.body = { message: 'something went wrong' }
            }
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
   *              - Camera-set
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
            if (camera.status !== 1) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Camera is Inactive'
                }
            }
            const device = await CameraDevice.findOneOrFail({ where: { id: camera.camera_device } })
            const livestream_url = await new CameraIntegration().deviceFactory(device, cameraApiCodes.LIVESTREAM, camera.service_id)
            const rtsp_url = livestream_url.split('://')[0].concat(`://${device.username}:${device.password}@`).concat(livestream_url.split('://')[1])
            ctx.body = { url: rtsp_url }
        } catch (err) {
            ctx.status = err.status || 400
            ctx.body = err
        }
        return ctx.body
    }
}
