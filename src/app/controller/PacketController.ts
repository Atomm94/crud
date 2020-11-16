import { DefaultContext } from 'koa'
import { Packet } from '../model/entity/Packet'
import * as Models from '../model/entity/index'

export default class PacketController {
    /**
     *
     * @swagger
     *  /packet:
     *      post:
     *          tags:
     *              - Packet
     *          summary: Creates a packet.
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
     *              name: packet
     *              description: The packet to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  description:
     *                      type: string
     *                  packet_type:
     *                      type: number
     *                  free:
     *                      type: boolean
     *                  price:
     *                      type: number
     *                  pay_terms:
     *                      type: JSON
     *                  status:
     *                      type: boolean
     *          responses:
     *              '201':
     *                  description: A packet object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await Packet.addItem(ctx.request.body as Packet)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /packet:
     *      put:
     *          tags:
     *              - Packet
     *          summary: Update a packet.
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
     *              name: packet
     *              description: The packet to create.
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
     *                  description:
     *                      type: string
     *                  packet_type:
     *                      type: number
     *                  free:
     *                      type: boolean
     *                  price:
     *                      type: number
     *                  pay_terms:
     *                      type: JSON
     *                  status:
     *                      type: boolean
     *          responses:
     *              '201':
     *                  description: A packet updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            ctx.body = await Packet.updateItem(ctx.request.body as Packet)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /packet/{id}:
     *      get:
     *          tags:
     *              - Packet
     *          summary: Return packet by ID
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
            const relations = ['packet_types']
            ctx.body = await Packet.getItem(+ctx.params.id, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /packet:
     *      delete:
     *          tags:
     *              - Packet
     *          summary: Delete a packet.
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
     *              name: packet
     *              description: The packet to create.
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
     *                  description: packet has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            ctx.body = await Packet.destroyItem(ctx.request.body as { id: number })
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /packet:
     *      get:
     *          tags:
     *              - Packet
     *          summary: Return packet list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of packet
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            req_data.relations = ['packet_types']
            ctx.body = await Packet.getAllItems(req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /packetExtraSettings:
     *      get:
     *          tags:
     *              - Packet
     *          summary: Return packet extra settings
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Packet settings
     *              '401':
     *                  description: Unauthorized
     */
    public static async getExtraSettings (ctx: DefaultContext) {
        try {
            const models: any = Models
            const data: any = {
                resources: [],
                features: null
            }
            const features: any = {}
            Object.keys(models).forEach((model: string) => {
                if (models[model].resource) {
                    data.resources.push(model)
                }
                if (models[model].features) {
                    Object.keys(models[model].features).forEach((feature: string) => {
                        if (features[model]) {
                            features[model].push(feature)
                        } else {
                            features[model] = [feature]
                        }
                    })
                }
            })
            if (Object.keys(features).length) data.features = features

            ctx.body = data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
