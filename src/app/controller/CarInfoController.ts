import { DefaultContext } from 'koa'
import { CarInfo } from '../model/entity/CarInfo'
export default class CarInfoController {
    /**
     *
     * @swagger
     *  /carInfo:
     *      post:
     *          tags:
     *              - CarInfo
     *          summary: Creates a carInfo.
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
     *              name: carInfo
     *              description: The carInfo to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  model:
     *                      type: string
     *                  color:
     *                      type: string
     *                  lp_number:
     *                      type: number
     *                  car_credential:
     *                      type: string
     *                  car_event:
     *                      type: boolean
     *          responses:
     *              '201':
     *                  description: A carInfo object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await CarInfo.addItem(ctx.request.body as CarInfo)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /carInfo:
     *      put:
     *          tags:
     *              - CarInfo
     *          summary: Update a carInfo.
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
     *              name: carInfo
     *              description: The carInfo to create.
     *              schema:
     *                type: object
     *                required:
     *                  - id
     *                properties:
     *                  id:
     *                      type: number
     *                      example: 1
     *                  model:
     *                      type: string
     *                  color:
     *                      type: string
     *                  lp_number:
     *                      type: number
     *                  car_credential:
     *                      type: string
     *                  car_event:
     *                      type: boolean
     *          responses:
     *              '201':
     *                  description: A carInfo updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await CarInfo.updateItem(ctx.request.body as CarInfo)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /carInfo/{id}:
     *      get:
     *          tags:
     *              - CarInfo
     *          summary: Return carInfo by ID
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
            ctx.body = await CarInfo.getItem(+ctx.params.id)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /carInfo:
     *      delete:
     *          tags:
     *              - CarInfo
     *          summary: Delete a carInfo.
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
     *              name: carInfo
     *              description: The carInfo to create.
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
     *                  description: carInfo has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await CarInfo.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /carInfo:
     *      get:
     *          tags:
     *              - CarInfo
     *          summary: Return carInfo list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of carInfo
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            ctx.body = await CarInfo.getAllItems(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
