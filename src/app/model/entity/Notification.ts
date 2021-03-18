import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('notification')
export class Notification extends MainEntity {
    @Column('int', { name: 'confirmed', nullable: true })
    confirmed: number | null

    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @Column('varchar', { name: 'event', nullable: false })
    event: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    public static async addItem (data: Notification) {
        const notification = new Notification()

        notification.access_point = data.access_point
        notification.event = data.event
        if ('description' in data) notification.description = data.description
        notification.company = data.company

        return new Promise((resolve, reject) => {
            this.save(notification)
                .then((item: Notification) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Notification) {
        const notification = await this.findOneOrFail(data.id)

        if ('confirmed' in data) notification.confirmed = data.confirmed
        if ('access_point' in data) notification.access_point = data.access_point
        if ('event' in data) notification.event = data.event
        if ('description' in data) notification.description = data.description

        if (!notification) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(notification)
                .then((item: Notification) => {
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
                .then((item: Notification) => {
                    resolve(item)
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
