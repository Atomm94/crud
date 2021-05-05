import { DefaultContext } from 'koa'
import * as Models from '../model/entity/index'
import { Package } from '../model/entity/Package'
import { Company } from '../model/entity/Company'
import { Feature } from '../middleware/feature'

export default class PackageController {
    /**
     *
     * @swagger
     *  /package:
     *      post:
     *          tags:
     *              - Package
     *          summary: Creates a package.
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
     *              name: package
     *              description: The package to create.
     *              schema:
     *                type: object
     *                required:
     *                properties:
     *                  name:
     *                      type: string
     *                  description:
     *                      type: string
     *                  package_type:
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
     *                  description: A package object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */

    public static async add (ctx: DefaultContext) {
        try {
            ctx.body = await Package.addItem(ctx.request.body as Package)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /package:
     *      put:
     *          tags:
     *              - Package
     *          summary: Update a package.
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
     *              name: package
     *              description: The package to create.
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
     *                  package_type:
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
     *                  description: A package updated object
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async update (ctx: DefaultContext) {
        try {
            const updated = await Package.updateItem(ctx.request.body as Package)
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
     * /package/{id}:
     *      get:
     *          tags:
     *              - Package
     *          summary: Return package by ID
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
                const company = await Company.getItem(user.company)
                where = {
                    package_type: company.package_type,
                    status: true
                }
            }

            const relations = ['package_types']
            ctx.body = await Package.getItem(+ctx.params.id, where, relations)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /package:
     *      delete:
     *          tags:
     *              - Package
     *          summary: Delete a package.
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
     *              name: package
     *              description: The package to create.
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
     *                  description: package has been deleted
     *              '422':
     *                  description: Wrong data
     */
    public static async destroy (ctx: DefaultContext) {
        try {
            const req_data: any = ctx.request.body
            const where = { id: req_data.id }
            ctx.body = await Package.destroyItem(where)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /package:
     *      get:
     *          tags:
     *              - Package
     *          summary: Return package list
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of package
     *              '401':
     *                  description: Unauthorized
     */
    public static async getAll (ctx: DefaultContext) {
        try {
            const req_data = ctx.query
            req_data.relations = ['package_types']
            const user = ctx.user
            if (user.company) {
                const company = await Company.getItem(user.company)
                req_data.where = {
                    package_type: {
                        '=': company.package_type
                    },
                    status: {
                        '=': true
                    }
                }
                const data = await Package.getAllItems(req_data)
                ctx.body = {
                    data: data,
                    selected: company.package
                }
            } else {
                ctx.body = await Package.getAllItems(req_data)
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
     * /packageExtraSettings:
     *      get:
     *          tags:
     *              - Package
     *          summary: Return package extra settings
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *              - in: query
     *                name: service
     *                description: service company
     *                schema:
     *                    type: boolean
     *          responses:
     *              '200':
     *                  description: Package settings
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
            if (!ctx.query.service) {
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
            } else {
                const feature: any = Feature.ServiceFeatures
                const features: any = {}
                const packageTypes = await Models.PackageType.find({ service: false })
                packageTypes.forEach(packageType => {
                    data.resources.push(packageType.name)
                })
                Object.keys(models).forEach((model: string) => {
                    if (models[model].serviceResource) {
                        data.resources.push(model)
                    }
                })
                const featureList = Object.keys(feature)
                features.Features = featureList
                if (Object.keys(features).length) data.features = features
            }

            ctx.body = data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
