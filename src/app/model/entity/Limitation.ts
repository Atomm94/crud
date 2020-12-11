import {
    Entity,
    Column,
    OneToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { User } from './User'

@Entity('limitation')
export class Limitation extends MainEntity {
    @Column('boolean', { name: 'enable_date', default: false })
    enable_date: boolean

    @Column('timestamp', { name: 'valid_from', nullable: true })
    valid_from: string | null

    @Column('timestamp', { name: 'valid_due', nullable: true })
    valid_due: string | null

    @Column('boolean', { name: 'pass_counter_enable', default: false })
    pass_counter_enable: boolean

    @Column('int', { name: 'pass_counter_passes', nullable: false })
    pass_counter_passes: number

    @Column('int', { name: 'pass_counter_current', nullable: false })
    pass_counter_current: number

    @Column('boolean', { name: 'first_use_counter_enable', default: false })
    first_use_counter_enable: boolean

    @Column('int', { name: 'first_use_counter_days', nullable: false })
    first_use_counter_days: number

    @Column('int', { name: 'first_use_counter_current', nullable: false })
    first_use_counter_current: number

    @Column('boolean', { name: 'last_use_counter_enable', default: false })
    last_use_counter_enable: boolean

    @Column('int', { name: 'last_use_counter_days', nullable: false })
    last_use_counter_days: number

    @Column('int', { name: 'last_use_counter_current', nullable: false })
    last_use_counter_current: number

    @OneToOne(type => User, user => user.limitations, { nullable: true })
    user: User | null;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: Limitation) {
        const limitation = new Limitation()

        limitation.enable_date = data.enable_date
        limitation.valid_from = data.valid_from
        limitation.valid_due = data.valid_due
        limitation.pass_counter_enable = data.pass_counter_enable
        limitation.pass_counter_passes = data.pass_counter_passes
        limitation.pass_counter_current = data.pass_counter_current
        limitation.first_use_counter_enable = data.first_use_counter_enable
        limitation.first_use_counter_days = data.first_use_counter_days
        limitation.first_use_counter_current = data.first_use_counter_current
        limitation.last_use_counter_enable = data.last_use_counter_enable
        limitation.last_use_counter_days = data.last_use_counter_days
        limitation.last_use_counter_current = data.last_use_counter_current

        return new Promise((resolve, reject) => {
            this.save(limitation)
                .then((item: Limitation) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Limitation) {
        const limitation = await this.findOneOrFail(data.id)

        if ('enable_date' in data) limitation.enable_date = data.enable_date
        if ('valid_from' in data) limitation.valid_from = data.valid_from
        if ('valid_due' in data) limitation.valid_due = data.valid_due
        if ('pass_counter_enable' in data) limitation.pass_counter_enable = data.pass_counter_enable
        if ('pass_counter_passes' in data) limitation.pass_counter_passes = data.pass_counter_passes
        if ('pass_counter_current' in data) limitation.pass_counter_current = data.pass_counter_current
        if ('first_use_counter_enable' in data) limitation.first_use_counter_enable = data.first_use_counter_enable
        if ('first_use_counter_days' in data) limitation.first_use_counter_days = data.first_use_counter_days
        if ('first_use_counter_current' in data) limitation.first_use_counter_current = data.first_use_counter_current
        if ('last_use_counter_enable' in data) limitation.last_use_counter_enable = data.last_use_counter_enable
        if ('last_use_counter_days' in data) limitation.last_use_counter_days = data.last_use_counter_days
        if ('last_use_counter_current' in data) limitation.last_use_counter_current = data.last_use_counter_current

        if (!limitation) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(limitation)
                .then((item: Limitation) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail(itemId)
                .then((item: Limitation) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (id: number) {
        const itemId: number = id
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
