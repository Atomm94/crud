import {
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    Index,
    getRepository,
    Not,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual,
    Equal,
    Like,
    Between,
    In,
    IsNull,
    AfterInsert,
    AfterRemove
} from 'typeorm'
import { CompanyResources, Company } from '.'
import { accessPointType } from '../../enums/accessPointType.enum'
import { credentialType } from '../../enums/credentialType.enum'
import { resourceKeys } from '../../enums/resourceKeys.enum'

import * as Models from './index'

export class MainEntity extends BaseEntity {
    @Index()
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', name: 'create_date' })
    createDate: string;

    @UpdateDateColumn({ type: 'timestamp', name: 'update_date' })
    updateDate: string;

    @AfterInsert()
    async increaseCompanyUsedResource () {
        const self: any = this

        if (self && self.company && self.constructor && self.constructor.name) {
            // console.log('increaseCompanyUsedResource self', self.constructor.name, self.id)

            const models: any = Models
            let model_name: any = self.constructor.name
            let company = await Company.findOne({ where: { id: self.company } }) as Company

            if (company && company.partition_parent_id) {
                company = await Company.findOne({ where: { id: company.partition_parent_id } }) as Company
            }
            if (company) {
                if (models[model_name] && models[model_name].resource) {
                    // console.log('increaseCompanyUsedResource resource', true)

                    const company_resources = await CompanyResources.findOne({ where: { company: company.id } })
                    // console.log('increaseCompanyUsedResource company_resources', company_resources)
                    if (model_name === 'AccessPoint') {
                        if (self.type === accessPointType.FLOOR) {
                            model_name = resourceKeys.ELEVATOR
                        } else if ([accessPointType.TURNSTILE_ONE_SIDE, accessPointType.TURNSTILE_TWO_SIDE].includes(self.type)) {
                            model_name = resourceKeys.TURNSTILE
                        }
                    }

                    if (company_resources) {
                        const used: any = JSON.parse(company_resources.used)
                        if (used[model_name]) {
                            used[model_name]++
                        } else {
                            used[model_name] = 1
                        }

                        // console.log('increaseCompanyUsedResource used', JSON.stringify(used))
                        company_resources.used = JSON.stringify(used)
                        await company_resources.save()
                    }
                } else if (model_name === 'Credential' && self.type === credentialType.VIKEY) {
                    const resource_name = resourceKeys.VIRTUAL_KEYS
                    const company_resources = await CompanyResources.findOne({ where: { company: self.company } })
                    if (company_resources) {
                        const used: any = JSON.parse(company_resources.used)
                        if (used[resource_name]) {
                            used[resource_name]++
                        } else {
                            used[resource_name] = 1
                        }
                        company_resources.used = JSON.stringify(used)
                        await company_resources.save()
                    }
                }
            }
        }
    }

    @AfterRemove()
    async decreaseCompanyUsedResource () {
        const self: any = this
        if (self && self.company && self.constructor && self.constructor.name) {
            // console.log('decreaseCompanyUsedResource self', self.constructor.name, self)

            const models: any = Models
            const model_name: any = self.constructor.name
            if (models[model_name] && models[model_name].resource) {
                let company = await Company.findOne({ where: { id: self.company } }) as Company
                if (company && company.partition_parent_id) {
                    company = await Company.findOne({ where: { id: company.partition_parent_id } }) as Company
                }

                if (company) {
                    const company_resources = await CompanyResources.findOne({ where: { company: company.id } })
                    if (company_resources) {
                        const used: any = JSON.parse(company_resources.used)
                        if (model_name in used) {
                            used[model_name]--
                        } else {
                            used[model_name] = 0
                        }
                        company_resources.used = JSON.stringify(used)
                        await company_resources.save()
                    }
                }
            }
        }
    }

    public static gettingActions: boolean = true
    public static gettingAttributes: boolean = true

    public static resource: boolean = false
    public static serviceResource: boolean = false
    public static features: any = false
    public static fields_that_used_in_sending: Array<string> | null = null

    public static async findByParams (data: any = {}) {
        let where: any = {}
        if (data.status) {
            let status = data.status
            if (status === 'true') {
                status = true
            } else if (status === 'false') {
                status = false
            }
            where.status = status
        }

        if (data.where) {
            if (typeof data.where === 'string') data.where = JSON.parse(data.where)
            Object.keys(data.where).forEach(column => {
                if (typeof data.where[column] === 'object') {
                    Object.keys(data.where[column]).forEach((el: any) => {
                        where[column] = this.changeAdvancedOptions(el, data.where[column][el])
                    })
                } else {
                    where[column] = this.changeAdvancedOptions('=', data.where[column])
                }
            })
        }

        if (data.orWhere) {
            const orWhere: any = []
            data.orWhere.forEach((item: any) => {
                Object.keys(item).forEach(column => {
                    if (typeof item[column] === 'object') {
                        Object.keys(item[column]).forEach((el: any) => {
                            item[column] = this.changeAdvancedOptions(el, item[column][el])
                        })
                    } else {
                        item[column] = this.changeAdvancedOptions('=', item[column])
                    }
                })

                item = {
                    ...where,
                    ...item
                }
                orWhere.push(item)
            })
            where = orWhere
        }

        let take = data.page ? data.page_items_count ? (data.page_items_count > 10000) ? 10000 : data.page_items_count : 25 : 100
        const skip = data.page_items_count && data.page ? (data.page - 1) * data.page_items_count : 0
        let finally_total

        if (this.resource && data.packageExtraSettings) {
            const model_name = this.constructor.name
            if (!data.packageExtraSettings.resources[model_name]) data.packageExtraSettings.resources[model_name] = 0
            const resource_limit = Number(data.packageExtraSettings.resources[model_name])
            if (take > resource_limit) {
                take = resource_limit
                finally_total = resource_limit
            }
        }
        let dataPromise: any = this.createQueryBuilder(this.name)
            .where(where)
            .take(take)
            .skip(skip)
        // if (data.search) {
        //     dataPromise = await addSearchWheres(dataPromise, this, data.search, data.isAdmin, data.search_fields)
        // }
        if (data.relations) {
            const relations = Object.keys(data.relations)
            for (let i = 0; i < relations.length; i++) {
                const element = relations[i]
                const relationAs = `${element.split('.').slice(-1)[0]}`
                const relationName = (element.indexOf('.') === -1) ? `${this.name}.${element}` : element.split('.').slice(-2).join('.')
                dataPromise = dataPromise
                    // .leftJoinAndSelect(`${this.name}.${element}`, element)
                    .leftJoinAndSelect(relationName, relationAs)
            }
        }
        if (data.orderBy && Object.keys(data.orderBy).length) {
            const orderKeys = Object.keys(data.orderBy)
            for (let i = 0; i < orderKeys.length; i++) {
                const orderKey = orderKeys[i]
                if (i < 1) {
                    dataPromise = dataPromise
                        .orderBy(orderKey, data.orderBy[orderKey])
                } else {
                    dataPromise = dataPromise
                        .addOrderBy(orderKey, data.orderBy[orderKey])
                }
            }
        } else {
            dataPromise = dataPromise
                .orderBy(`${this.name}.id`, 'DESC')
        }
        const result = await dataPromise
            .getMany()

        // const [result, total] = await this.findAndCount({
        //     where: where,
        //     order: data.sort ? { [data.sort.split(' ')[0]]: data.sort.split(' ')[1] } : { id: 'DESC' },
        //     take: take,
        //     skip: skip,
        //     relations: data.relations ? data.relations : []
        // })
        // const result = await this.find({
        //     where: where,
        //     order: data.sort ? { [data.sort.split(' ')[0]]: data.sort.split(' ')[1] } : { id: 'DESC' },
        //     take: take,
        //     skip: skip,
        //     relations: data.relations ? data.relations : []
        // })

        if (data.page) {
            const total = await this.count({ where: where })
            if (!finally_total) finally_total = total
            return {
                data: result,
                count: finally_total
            }
        } else {
            return result
        }
    }

    public static changeAdvancedOptions (option: string, value: any) {
        let res: any = null
        switch (option) {
            case '!=':
                res = Not(value)
                break
            case '<':
                res = LessThan(value)
                break
            case '<=':
                res = LessThanOrEqual(value)
                break
            case '>':
                res = MoreThan(value)
                break
            case '>=':
                res = MoreThanOrEqual(value)
                break
            case '=':
                if (value === null) {
                    res = IsNull()
                } else {
                    res = Equal(value)
                }
                break
            case 'in':
                res = In(value)
                break
            case 'nin':
                res = Not(In(value))
                break
            case 'contains':
                res = Like(`%${value}%`)
                break
            case 'startsWith':
                res = Like(`${value}%`)
                break
            case 'endsWith':
                res = Like(`%${value}`)
                break
            case 'between':
                res = Between(value[0], value[1])
                break

            default:
                break
        }
        return res
    }

    public static getActions (action_value: boolean = false) {
        const self: any = this
        const model_actions = Object.getOwnPropertyNames(self)
            .filter((item: any) => typeof self[item] === 'function')
        // console.log('model_actions', model_actions)
        const model_actions_data: any = {}
        model_actions.forEach(action => {
            model_actions_data[action] = action_value
        })

        // const MainEntityClass: any = MainEntity
        // const MainEntity_actions = Object.getOwnPropertyNames(MainEntityClass)
        //     .filter((item: any) => typeof MainEntityClass[item] === 'function' && model_actions.indexOf(item) === -1)
        // console.log('MainEntity_actions', MainEntity_actions)

        return { ...model_actions_data }
        // return [...model_actions, ...MainEntity_actions]
    }

    public static getAttributes () {
        return getRepository(this).metadata.propertiesMap
    }

    public static getModelParams () {
        return {
            actions: this.getActions(),
            attributes: this.getAttributes()
        }
    }
}
