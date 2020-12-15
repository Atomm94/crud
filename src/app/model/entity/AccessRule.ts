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
import { Limitation } from '.'

@Entity('access_rule')
export class AccessRule extends MainEntity {
    @Column('int', { name: 'access_right', nullable: false })
    access_right: number

    @Column('int', { name: 'entry', nullable: false })
    entry: number

    @Column('int', { name: 'schedule', nullable: false })
    schedule: number

    @Column('int', { name: 'limitation', nullable: true })
    limitation: number | null

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

    @ManyToOne(type => Limitation, limitation => limitation.access_rules)
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation;

    public static async addItem (data: AccessRule) {
        const accessRule = new AccessRule()

        accessRule.access_right = data.access_right
        accessRule.entry = data.entry
        accessRule.schedule = data.schedule
        accessRule.limitation = data.limitation
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

    public static async updateItem (data: AccessRule) {
        const accessRule = await this.findOneOrFail(data.id)

        if ('access_right' in data) accessRule.access_right = data.access_right
        if ('entry' in data) accessRule.entry = data.entry
        if ('schedule' in data) accessRule.schedule = data.schedule
        if ('limitation' in data) accessRule.limitation = data.limitation

        if (!accessRule) return { status: 400, message: 'Item not found' }
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

    public static async getItem (where: any) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where
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
