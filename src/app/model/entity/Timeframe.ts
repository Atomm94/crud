import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Schedule } from './Schedule'

@Entity('timeframe')
export class Timeframe extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('time', { name: 'start', nullable: false })
    start: string

    @Column('time', { name: 'end', nullable: false })
    end: string

    @Column('int', { name: 'schedule', nullable: false })
    schedule: number

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Schedule, schedule => schedule.timeframes)
    @JoinColumn({ name: 'schedule' })
    schedules: Schedule;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: Timeframe) {
        const timeframe = new Timeframe()

        timeframe.name = data.name
        timeframe.start = data.start
        timeframe.end = data.end
        timeframe.schedule = data.schedule
        timeframe.company = data.company

        return new Promise((resolve, reject) => {
            this.save(timeframe)
                .then((item: Timeframe) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any) {
        const updateTimeframe: Timeframe[] = []
        if (data.old_name && data.new_name && data.schedule) {
            const timeframes = await this.find({ name: data.old_name, schedule: data.schedule })
            if (timeframes.length) {
                for (let i = 0; i < timeframes.length; i++) {
                    const timeframe = timeframes[i]
                    if ('new_name' in data) timeframe.name = data.new_name
                    updateTimeframe.push(timeframe)
                }
            }
        } else if (data.id) {
            const timeframes = await this.findOneOrFail(data.id)
            if ('start' in data) timeframes.start = data.start
            if ('end' in data) timeframes.end = data.end
            updateTimeframe.push(timeframes)
        } else {
            return { status: 400, message: 'Item not found' }
        }

        if (updateTimeframe.length) {
            console.log(updateTimeframe)
            return new Promise((resolve, reject) => {
                this.save(updateTimeframe as Timeframe[])
                    .then((item: Timeframe | Timeframe[]) => {
                        resolve(item)
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
            return new Promise((resolve, reject) => {
                this.delete({ name: data.name, schedule: data.schedule })
                    .then(() => {
                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            })
        } else if (data.id) {
            return new Promise((resolve, reject) => {
                this.delete(data.id)
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
