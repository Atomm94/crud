import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

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

    public static async updateItem (data: Timeframe) {
        const timeframe = await this.findOneOrFail(data.id)

        if ('name' in data) timeframe.name = data.name
        if ('start' in data) timeframe.start = data.start
        if ('end' in data) timeframe.end = data.end
        if ('schedule' in data) timeframe.schedule = data.schedule
        if ('company' in data) timeframe.company = data.company

        if (!timeframe) return { status: 400, messsage: 'Item not found' }
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

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail(itemId)
                .then((item: Timeframe) => {
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
