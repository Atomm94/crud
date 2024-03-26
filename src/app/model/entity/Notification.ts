import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm'
import { AccessPoint } from '.'

import { MainEntity } from './MainEntity'

@Entity('notification')
@Index('createDate|company', ['createDate', 'company'])
@Index('confirmed|company', ['confirmed', 'company'])
@Index('notification_company', ['company'])
export class Notification extends MainEntity {
    @Column('bigint', { name: 'confirmed', nullable: true })
    confirmed: number | null

    @Column('int', { name: 'access_point', nullable: true })
    access_point: number | null

    @Column('varchar', { name: 'access_point_name', nullable: true })
    access_point_name: string | null

    @Column('varchar', { name: 'event', nullable: false })
    event: string

    @Column('longtext', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AccessPoint, access_point => access_point.notifications)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint;

    public static async addItem (data: Notification) {
        const notification = new Notification()

        if ('access_point' in data) notification.access_point = data.access_point
        if ('access_point_name' in data) notification.access_point_name = data.access_point_name
        notification.event = data.event
        if ('description' in data) notification.description = data.description
        notification.company = data.company

        return new Promise((resolve, reject) => {
            this.save(notification, { transaction: false })
                .then((item: Notification) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Notification) {
        const notification = await this.findOneOrFail({ where: { id: data.id } })

        if ('confirmed' in data) notification.confirmed = data.confirmed
        if ('access_point' in data) notification.access_point = data.access_point
        if ('access_point_name' in data) notification.access_point_name = data.access_point_name
        if ('event' in data) notification.event = data.event
        if ('description' in data) notification.description = data.description

        if (!notification) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(notification, { transaction: false })
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
            this.findOneOrFail({ where: { id: itemId } })
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
