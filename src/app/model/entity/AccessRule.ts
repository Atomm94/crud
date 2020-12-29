import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRight } from './AccessRight'
import { Entry } from './Entry'
import { Schedule } from './Schedule'

@Entity('access_rule')
export class AccessRule extends MainEntity {
    @Column('int', { name: 'access_right', nullable: false })
    access_right: number

    @Column('int', { name: 'entry', nullable: false })
    entry: number

    @Column('int', { name: 'schedule', nullable: false })
    schedule: number

    @Column('boolean', { name: 'access_in_holidays', default: false })
    access_in_holidays: boolean

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.access_rules)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @ManyToOne(type => AccessRight, access_right => access_right.access_rules)
    @JoinColumn({ name: 'access_right' })
    access_rights: AccessRight;

    @ManyToOne(type => Entry, entry => entry.access_rules)
    @JoinColumn({ name: 'entry' })
    entries: Entry;

    @ManyToOne(type => Schedule, schedule => schedule.access_rules)
    @JoinColumn({ name: 'schedule' })
    schedules: Schedule;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: AccessRule) {
        const accessRule = new AccessRule()

        accessRule.access_right = data.access_right
        accessRule.entry = data.entry
        accessRule.schedule = data.schedule
        if ('access_in_holidays' in data) accessRule.access_in_holidays = data.access_in_holidays
        accessRule.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessRule)
                .then((item: AccessRule) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessRule): Promise<{ [key: string]: any }> {
        const accessRule = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, accessRule)

        // if ('access_right' in data) accessRule.access_right = data.access_right
        // if ('entry' in data) accessRule.entry = data.entry
        if ('schedule' in data) accessRule.schedule = data.schedule
        if ('access_in_holidays' in data) accessRule.access_in_holidays = data.access_in_holidays

        if (!accessRule) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessRule)
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

    public static async destroyItem (data: { id: number }) {
        const itemId: number = +data.id
        return new Promise((resolve, reject) => {
            this.delete(itemId)
                .then(() => {
                    resolve({ message: 'success' })
                })
                .catch((error: any) => {
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
