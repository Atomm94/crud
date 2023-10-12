import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
    Index
} from 'typeorm'

import {
    MainEntity,
    Company,
    AccessRight,
    AccessPoint,
    Schedule
} from './index'
import { minusResource } from '../../functions/minusResource'

@Index('access_right|access_point|is_delete', ['access_right', 'access_point', 'is_delete'], { unique: true })

@Entity('access_rule')
export class AccessRule extends MainEntity {
    @Column('int', { name: 'access_right', nullable: false })
    access_right: number

    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @Column('int', { name: 'schedule', nullable: false })
    schedule: number

    @Column('boolean', { name: 'access_in_holidays', default: false })
    access_in_holidays: boolean

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public delete_date: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.access_rules)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @ManyToOne(type => AccessRight, access_right => access_right.access_rules)
    @JoinColumn({ name: 'access_right' })
    access_rights: AccessRight;

    @ManyToOne(type => AccessPoint, access_point => access_point.access_rules)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint;

    @ManyToOne(type => Schedule, schedule => schedule.access_rules)
    @JoinColumn({ name: 'schedule' })
    schedules: Schedule;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: AccessRule): Promise<AccessRule> {
        const accessRule = new AccessRule()

        accessRule.access_right = data.access_right
        accessRule.access_point = data.access_point
        accessRule.schedule = data.schedule
        if ('access_in_holidays' in data) accessRule.access_in_holidays = data.access_in_holidays
        accessRule.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessRule, { transaction: false })
                .then((item: AccessRule) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessRule): Promise<{ [key: string]: any }> {
        const accessRule = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, accessRule)

        // if ('access_right' in data) accessRule.access_right = data.access_right
        // if ('access_point' in data) accessRule.access_point = data.access_point
        if ('schedule' in data) accessRule.schedule = data.schedule
        if ('access_in_holidays' in data) accessRule.access_in_holidays = data.access_in_holidays

        if (!accessRule) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessRule, { transaction: false })
                .then((item: AccessRule) => {
                    resolve({
                        old: oldData,
                        new: item
                    })
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: AccessRule) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const where: any = { id: data.id }
            if (data.company) where.company = data.company
            this.findOneOrFail(where).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        minusResource(this.name, data.company)

                        const rule_data: any = await this.createQueryBuilder('access_rule')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()
                        rule_data.is_delete = (new Date()).getTime()
                        await this.save(rule_data, { transaction: false })

                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            }).catch((error: any) => {
                reject(error)
            })
        })
    }

    public static async getAllItems (params?: any) {
        return new Promise((resolve, reject) => {
            this.findByParams(params)
                .then((items) => {
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
