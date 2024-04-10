import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn
} from 'typeorm'
import { scheduleType } from '../../enums/scheduleType.enum'

import { MainEntityColumns } from './MainEntityColumns'
import { Schedule } from './Schedule'

@Entity('timeframe')
export class Timeframe extends MainEntityColumns {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('time', { name: 'start', nullable: false })
    start: string

    @Column('time', { name: 'end', nullable: false })
    end: string

    @Column('int', { name: 'schedule', nullable: false })
    schedule: number

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Schedule, schedule => schedule.timeframes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schedule' })
    schedules: Schedule;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: Timeframe): Promise<Timeframe> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const schedule = await Schedule.findOneOrFail({ where: { id: data.schedule } })
            if (schedule.type === scheduleType.DAILY || schedule.type === scheduleType.WEEKLY) {
                const timeframes: any = await Timeframe.getAllItems({ where: { schedule: { '=': data.schedule }, name: { '=': data.name } } })
                if (schedule.type === scheduleType.DAILY && timeframes.length >= 6) {
                    return reject(new Error(`timeframe limit for ${scheduleType.DAILY} reached!`))
                } else if (schedule.type === scheduleType.WEEKLY && timeframes.length >= 4) {
                    return reject(new Error(`timeframe limit for ${scheduleType.WEEKLY} reached!`))
                }
            }
            const timeframe = new Timeframe()

            timeframe.name = data.name
            timeframe.start = data.start
            timeframe.end = data.end
            timeframe.schedule = data.schedule
            timeframe.company = data.company

            this.save(timeframe, { transaction: false })
                .then((item: Timeframe) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any): Promise<{ [key: string]: any }> {
        const updateTimeframe: Timeframe[] = []
        let oldData: Timeframe[] | Timeframe
        if (data.old_name && data.new_name && data.schedule) {
            const timeframes = await this.find({ where: { name: data.old_name, schedule: data.schedule } })
            oldData = timeframes

            if (timeframes.length) {
                for (let i = 0; i < timeframes.length; i++) {
                    const timeframe = timeframes[i]
                    if ('new_name' in data) timeframe.name = data.new_name
                    updateTimeframe.push(timeframe)
                }
            }
        } else if (data.id) {
            const timeframes = await this.findOneOrFail({ where: { id: data.id } })
            oldData = timeframes
            if ('start' in data) timeframes.start = data.start
            if ('end' in data) timeframes.end = data.end
            updateTimeframe.push(timeframes)
        } else {
            return { status: 400, message: 'Item not found' }
        }

        if (updateTimeframe.length) {
            return new Promise((resolve, reject) => {
                this.save(updateTimeframe as Timeframe[], { transaction: false })
                    .then((item: Timeframe | Timeframe[]) => {
                        resolve({
                            old: oldData,
                            new: item
                        })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            })
        } else {
            return { status: 400, message: 'Item not found' }
        }
    }

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: Timeframe) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: any) {
        if (data.name && data.schedule) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                this.softRemove(await this.findOneOrFail({ where: { name: data.name, schedule: data.schedule, company: data.company } }))
                    .then(() => {
                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            })
        } else if (data.id) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                this.softRemove(await this.findOneOrFail({ where: { id: data.id, company: data.company } }))

                    .then(() => {
                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            })
        } else {
            return { status: 400, message: 'Item not found' }
        }
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
