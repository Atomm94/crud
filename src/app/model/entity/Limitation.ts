import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Cardholder } from './Cardholder'
import { CardholderGroup } from './CardholderGroup'

@Entity('limitation')
export class Limitation extends MainEntity {
    @Column('boolean', { name: 'enable_date', default: false })
    enable_date: boolean

    @Column('datetime', { name: 'valid_from', nullable: true })
    valid_from: string | null

    @Column('datetime', { name: 'valid_due', nullable: true })
    valid_due: string | null

    @Column('boolean', { name: 'pass_counter_enable', default: false })
    pass_counter_enable: boolean

    @Column('int', { name: 'pass_counter_passes', nullable: true })
    pass_counter_passes: number | null

    @Column('int', { name: 'pass_counter_current', nullable: true })
    pass_counter_current: number | null

    @Column('boolean', { name: 'first_use_counter_enable', default: false })
    first_use_counter_enable: boolean

    @Column('int', { name: 'first_use_counter_days', nullable: true })
    first_use_counter_days: number | null

    @Column('int', { name: 'first_use_counter_current', nullable: true })
    first_use_counter_current: number | null

    @Column('boolean', { name: 'last_use_counter_enable', default: false })
    last_use_counter_enable: boolean

    @Column('int', { name: 'last_use_counter_days', nullable: true })
    last_use_counter_days: number | null

    @Column('int', { name: 'last_use_counter_current', nullable: true })
    last_use_counter_current: number | null

    @OneToMany(type => CardholderGroup, cardholder_group => cardholder_group.limitations)
    cardholder_groups: CardholderGroup[];

    @OneToMany(type => Cardholder, cardholder => cardholder.limitations)
    cardholders: Cardholder[];

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: Limitation):Promise<Limitation> {
        const limitation = new Limitation()

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

        return new Promise((resolve, reject) => {
            this.save(limitation, { transaction: false })
                .then((item: Limitation) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Limitation): Promise<{ [key: string]: any }> {
        const limitation = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, limitation)

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

        if (!limitation) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(limitation, { transaction: false })
                .then((item: Limitation) => {
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

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({ where: { id: itemId } })
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
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.remove(await this.findOneOrFail({ where: { id: itemId } }))
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
