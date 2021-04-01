import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { Admin, MainEntity } from './index'

@Entity('standard_report')

export class StandardReport extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'author', nullable: false })
    author: number

    @Column('longtext', { name: 'period', nullable: false })
    period: string

    @Column('time', { name: 'start_time', nullable: false })
    start_time: string

    @Column('time', { name: 'end_time', nullable: false })
    end_time: string

    @Column('longtext', { name: 'events', nullable: false })
    events: string

    @Column('longtext', { name: 'access_points', nullable: false })
    access_points: string

    @Column('longtext', { name: 'cardholders', nullable: false })
    cardholders: string

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Admin, admin => admin.reports)
    @JoinColumn({ name: 'author' })
    authors: Admin;

    public static async addItem (data: StandardReport) {
        const standardReport = new StandardReport()

        standardReport.name = data.name
        standardReport.description = data.description
        standardReport.author = data.author
        standardReport.period = JSON.stringify(data.period)
        standardReport.events = JSON.stringify(data.events)
        standardReport.access_points = JSON.stringify(data.access_points)
        standardReport.cardholders = JSON.stringify(data.cardholders)
        standardReport.company = data.company

        return new Promise((resolve, reject) => {
            this.save(standardReport)
                .then((item: StandardReport) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: StandardReport) {
        const standardReport = await this.findOneOrFail(data.id)

        if ('name' in data) standardReport.name = data.name
        if ('description' in data) standardReport.description = data.description
        if ('period' in data) standardReport.period = JSON.stringify(data.period)
        if ('events' in data) standardReport.events = JSON.stringify(data.events)
        if ('access_points' in data) standardReport.access_points = JSON.stringify(data.access_points)
        if ('cardholders' in data) standardReport.cardholders = JSON.stringify(data.cardholders)

        if (!standardReport) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(standardReport)
                .then((item: StandardReport) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where
            })
                .then((item: StandardReport) => {
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
                this.remove(data)
                    .then(() => {
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
