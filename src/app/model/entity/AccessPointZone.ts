import {
    Entity,
    Column,
    OneToMany,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm'
import { AntipassBack } from './AntipassBack'

import { MainEntity, AccessPoint } from './index'
import { Reader } from './Reader'

@Entity('access_point_zone')
export class AccessPointZone extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'antipass_back', nullable: true })
    antipass_back: number

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @Column('longtext', { name: 'apb_reset_timer', nullable: true })
    apb_reset_timer: string | null

    @Column('longtext', { name: 'people_limits_min', nullable: true })
    people_limits_min: string | null

    @Column('longtext', { name: 'people_limits_max', nullable: true })
    people_limits_max: string | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AntipassBack, antipass_back => antipass_back.access_point_zones, { nullable: true })
    @JoinColumn({ name: 'antipass_back' })
    antipass_backs: AntipassBack | null;

    @OneToMany(type => AccessPoint, access_point => access_point.access_point_zones)
    access_points: AccessPoint[];

    @OneToMany(type => Reader, reader => reader.leaving_zones)
    leaving_readers: Reader[];

    @OneToMany(type => Reader, reader => reader.came_to_zones)
    caming_readers: Reader[];

    public static async addItem (data: AccessPointZone) {
        const accessPointZone = new AccessPointZone()

        accessPointZone.name = data.name
        accessPointZone.description = data.description
        accessPointZone.parent_id = data.parent_id
        accessPointZone.apb_reset_timer = data.apb_reset_timer
        accessPointZone.people_limits_min = data.people_limits_min
        accessPointZone.people_limits_max = data.people_limits_max
        accessPointZone.company = data.company
        accessPointZone.antipass_back = data.antipass_back

        return new Promise((resolve, reject) => {
            this.save(accessPointZone, { transaction: false })
                .then((item: AccessPointZone) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessPointZone): Promise<{ [key: string]: any }> {
        const accessPointZone = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, accessPointZone)

        if ('name' in data) accessPointZone.name = data.name
        if ('description' in data) accessPointZone.description = data.description
        if ('parent_id' in data) accessPointZone.parent_id = data.parent_id
        if ('apb_reset_timer' in data) accessPointZone.apb_reset_timer = data.apb_reset_timer
        if ('people_limits_min' in data) accessPointZone.people_limits_min = data.people_limits_min
        if ('people_limits_max' in data) accessPointZone.people_limits_max = data.people_limits_max
        if ('antipass_back' in data) accessPointZone.antipass_back = data.antipass_back

        if (!accessPointZone) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessPointZone, { transaction: false })
                .then((item: AccessPointZone) => {
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
                .then((item: AccessPointZone) => {
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
            this.findOneOrFail({ where: { id: data.id, company: data.company } }).then((data: any) => {
                this.softRemove(data)
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
