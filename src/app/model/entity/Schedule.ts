import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    DeleteDateColumn
} from 'typeorm'

import { scheduleType } from '../../enums/scheduleType.enum'
import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRule } from './AccessRule'
import { Timeframe } from './Timeframe'
import { CardholderGroup } from './CardholderGroup'
import { Cardholder } from '.'
import { AutoTaskSchedule } from './AutoTaskSchedule'

import { minusResource } from '../../functions/minusResource'
@Entity('schedule')
export class Schedule extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('enum', { name: 'type', nullable: false, enum: scheduleType })
    type: scheduleType

    @Column('boolean', { name: 'custom', default: false })
    custom: boolean

    @Column('date', { name: 'start_from', nullable: true })
    start_from: Date

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.schedules)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @OneToMany(type => AccessRule, access_rule => access_rule.schedules)
    access_rules: AccessRule[];

    @OneToMany(type => Timeframe, timeframe => timeframe.schedules, { cascade: true })
    timeframes: Timeframe[];

    @OneToMany(type => CardholderGroup, cardholder_group => cardholder_group.time_attendances)
    cardholder_groups: CardholderGroup[];

    @OneToMany(type => Cardholder, cardholder => cardholder.time_attendances)
    cardholders: Cardholder[];

    @OneToMany(type => AutoTaskSchedule, auto_task_schedule => auto_task_schedule.schedules)
    auto_task_schedules: AutoTaskSchedule[];

    public static resource: boolean = true

    public static async addItem (data: Schedule) {
        const schedule = new Schedule()

        schedule.name = data.name
        schedule.description = data.description
        schedule.type = data.type
        if ('start_from' in data) schedule.start_from = data.start_from
        if ('custom' in data) schedule.custom = data.custom
        schedule.company = data.company

        return new Promise((resolve, reject) => {
            this.save(schedule)
                .then((item: Schedule) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Schedule): Promise<{ old: Schedule, new: Schedule } | { [key: string]: any }> {
        const schedule = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, schedule)

        if ('name' in data) schedule.name = data.name
        if ('description' in data) schedule.description = data.description
        if ('start_from' in data) schedule.start_from = data.start_from

        if (!schedule) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(schedule)
                .then((item: Schedule) => {
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
                .then((item: Schedule) => {
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
            this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        minusResource(this.name, data.company)
                        const timeframes = await Timeframe.getAllItems({ where: { schedule: data.id } }) as Timeframe[]
                        for (const timeframe of timeframes) {
                            Timeframe.destroyItem({ id: timeframe.id, company: timeframe.company })
                        }
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
