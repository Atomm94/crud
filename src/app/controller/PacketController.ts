import { DefaultContext } from 'koa'
import * as Models from '../model/entity/index'
import { Packet } from '../model/entity/Packet'
import { Company } from '../model/entity/Company'
import { Feature } from '../middleware/feature'

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
     *                      type: string
     *                  extra_settings:
     *                      type: string
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
     *                      type: string
     *                  extra_settings:
     *                      type: string
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
            const updated = await Packet.updateItem(ctx.request.body as Packet)
            ctx.oldData = updated.old
            ctx.body = updated.new
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
            const user = ctx.user
            let where: any = {}
            if (user.company) {
                const company: any = await Company.getItem(user.company)
                where = {
                    packet_type: company.packet_type
                }
            }

            const relations = ['packet_types']
            ctx.body = await Packet.getItem(+ctx.params.id, where, relations)
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
            const user = ctx.user
            if (user.company) {
                const company: any = await Company.getItem(user.company)
                req_data.where = {
                    packet_type: {
                        '=': company.packet_type
                    }
                }
                const data = await Packet.getAllItems(req_data)
                ctx.body = {
                    data: data,
                    selected: company.packet
                }
            } else {
                ctx.body = await Packet.getAllItems(req_data)
            }
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
            const feature: any = Feature
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
            })
            const featuresList = Object.getOwnPropertyNames(feature)
            if (featuresList.length) {
                featuresList.forEach((key: any) => {
                    if (feature[key] && typeof feature[key] === 'object' && key !== 'prototype') {
                        if (Object.getOwnPropertyNames(feature[key]).length) {
                            features[key] = Object.getOwnPropertyNames(feature[key])
                        }
                    }
                })
            }
            if (Object.keys(features).length) data.features = features

            ctx.body = data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
