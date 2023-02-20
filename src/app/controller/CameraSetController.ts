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
        try {
            const newCameraSet = await CameraSet.addItem({
                ...cameraSet,
                company: ctx.user.company
            })

            ctx.status = 201
            ctx.body = {
                message: 'Set added successfully',
                data: newCameraSet
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
     *          responses:
     *              '200':
     *                  description: The updated camera set object
     *              '400':
     *                  description: Unhandled server error
     */

    public static async update (ctx: DefaultContext) {
        const cameraSet = ctx.request.body
        try {
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

    public static async delete (ctx: DefaultContext) {
        const { id } = ctx.params

        try {
            const cameraSet = await CameraSet.findOneOrFail({ id })
            await CameraSet.softRemove([cameraSet])
            ctx.body = {
                message: 'camera set was deleted successfully'
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
}
