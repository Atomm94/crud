import { DefaultContext } from 'koa'
import * as Models from '../model/entity/index'
import { Package } from '../model/entity/Package'
import { PackageType } from '../model/entity/PackageType'
import { Company } from '../model/entity/Company'
import { Feature } from '../middleware/feature'
import { resourceKeys } from '../enums/resourceKeys.enum'
import { logUserEvents } from '../enums/logUserEvents.enum'

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
     *                  default:
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
            const req_data = ctx.request.body
            const old_default_package: any = await Package.createQueryBuilder('package')
                .where(`package.default = ${true}`)
                .getOne()

            const default_package_type: any = await PackageType.createQueryBuilder('package_type')
                .where(`package_type.default = ${true}`)
                .getOne()
            if (!default_package_type && req_data.default) {
                ctx.status = 400
                return ctx.body = {
                    message: 'There must be default package type'
                }
            }
            if (default_package_type && req_data.package_type !== default_package_type.id && req_data.default) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Default package must be in Default Package type'
                }
            }
            if (old_default_package && req_data.default) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Default Package can be only one'
                }
            }
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
     *                  default:
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
            const req_data = ctx.request.body
            const old_default_package: any = await Package.createQueryBuilder('package')
                .where(`package.default = ${true}`)
                .getOne()

            const default_package_type: any = await PackageType.createQueryBuilder('package_type')
                .where(`package_type.default = ${true}`)
                .getOne()

            if (!default_package_type && req_data.default) {
                ctx.status = 400
                return ctx.body = {
                    message: 'There must be default package type'
                }
            }
            if (default_package_type && req_data.package_type !== default_package_type.id && req_data.default) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Default package must be in Default Package type'
                }
            }
            if (old_default_package && old_default_package.id === req_data.id && req_data.default === false) {
                ctx.status = 400
                return ctx.body = { message: "Can't checkout Default Package" }
            }
            if (old_default_package && old_default_package.id !== req_data.id && req_data.default) {
                ctx.status = 400
                return ctx.body = {
                    message: 'Default Package can be only one'
                }
            }

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
            const package_data = await Package.findOneOrFail({ where: where })

            if (package_data.default) {
                ctx.status = 400
                return ctx.body = { message: "Can't delete Default Package" }
            }

            ctx.body = await Package.destroyItem(where)
            ctx.logsData = [{
                event: logUserEvents.DELETE,
                target: `${Package.name}/${package_data.name}`,
                value: { name: package_data.name }
            }]
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
            req_data.relations = { package_types: PackageType }
            const user = ctx.user
            if (user.company) {
                // const company = await Company.findOneOrFail({ where: { id: user.company }, relations: ['packages'] })

                const company = await Company.createQueryBuilder('company')
                    .where(`company.id = ${user.company}`)
                    .andWhere('company.delete_date is null')
                    .withDeleted()
                    .leftJoinAndSelect('company.packages', 'package')
                    .getOne()

                if (!company) {
                    ctx.status = 400
                    return ctx.body = { message: 'something went wrong' }
                }

                const where: any = {
                    package_type: { '=': company.package_type },
                    status: { '=': true }
                }
                if (company.package) {
                    where.id = { '!=': company.package }
                }
                req_data.where = where
                const data: any = await Package.getAllItems(req_data)
                if (company.package) {
                    data.push(company.packages)
                }

                const package_types = await PackageType.getAllItems({
                    where: {
                        status: { '=': true },
                        service: { '=': false }
                    }
                })

                ctx.body = {
                    data: data,
                    selected: company.package,
                    package_types: package_types
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
            if (ctx.query.service && ctx.query.service === 'true') {
                Object.keys(models).forEach((model: string) => {
                    if (models[model].serviceResource) {
                        data.resources.push(model)
                    }
                })

                const feature: any = Feature.ServiceFeatures
                const features: any = {}
                const featureList = Object.keys(feature)
                features.Features = featureList
                if (Object.keys(features).length) data.features = features
            } else {
                const features: any = {}
                Object.keys(models).forEach((model: string) => {
                    if (models[model].resource) {
                        data.resources.push(model)
                    }
                })
                data.resources.push(resourceKeys.VIRTUAL_KEYS,
                    resourceKeys.KEY_PER_USER,
                    resourceKeys.ELEVATOR,
                    resourceKeys.TURNSTILE
                )

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
            }

            ctx.body = data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
