import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { scheduleType } from '../../enums/scheduleType.enum'

@Entity('schedule')
export class Schedule extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('enum', { name: 'type', nullable: false, enum: scheduleType })
    type: scheduleType

    @Column('longtext', { name: 'settings', nullable: true })
    settings: string | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.schedules)
    @JoinColumn({ name: 'company' })
    companies: Company;

    public static async addItem (data: Schedule) {
        const schedule = new Schedule()

        schedule.name = data.name
        schedule.description = data.description
        schedule.type = data.type
        schedule.settings = data.settings
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

    public static async updateItem (data: Schedule) {
        const schedule = await this.findOneOrFail(data.id)

        if ('name' in data) schedule.name = data.name
        if ('description' in data) schedule.description = data.description
        if ('type' in data) schedule.type = data.type
        if ('settings' in data) schedule.settings = data.settings

        if (!schedule) return { status: 400, messsage: 'Item not found' }
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

    public static async getItem (where: any) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where
            })
                .then((item: Schedule) => {
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
