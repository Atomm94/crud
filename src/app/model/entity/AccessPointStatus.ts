import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
    // ManyToOne,
    // OneToMany,
    // JoinColumn
} from 'typeorm'
import { AccessPoint } from '.'
import { accessPointDoorState } from '../../enums/accessPointDoorState.enum'

import { MainEntity } from './MainEntity'
// import { Company } from './Company'
// import { Acu } from './Acu'

@Entity('access_point_status')
export class AccessPointStatus extends MainEntity {
    @Column('int', { name: 'access_point', nullable: false, unique: true })
    access_point: number

    @Column('int', { name: 'acu', nullable: false })
    acu: number

    @Column('longtext', { name: 'resources', nullable: true })
    resources: string | null

    @Column('enum', { name: 'door_state', enum: accessPointDoorState, default: accessPointDoorState.NO_SENSOR })
    door_state: accessPointDoorState

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AccessPoint, access_point => access_point.access_point_statuses)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint[];

    public static async addItem (data: AccessPointStatus): Promise<AccessPointStatus> {
        const accessPointStatus = new AccessPointStatus()

        accessPointStatus.access_point = data.access_point
        accessPointStatus.acu = data.acu
        if ('resources' in data) accessPointStatus.resources = (data.resources && typeof data.resources === 'object') ? JSON.stringify(data.resources) : data.resources
        accessPointStatus.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessPointStatus, { transaction: false })
                .then((item: AccessPointStatus) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessPointStatus): Promise<{ [key: string]: any }> {
        const accessPointStatus = await this.findOneOrFail({ where: { access_point: data.access_point } })
        const oldData = Object.assign({}, accessPointStatus)

        if ('resources' in data) accessPointStatus.resources = (data.resources && typeof data.resources === 'object') ? JSON.stringify(data.resources) : data.resources
        if ('door_state' in data) accessPointStatus.door_state = data.door_state

        if (!accessPointStatus) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessPointStatus, { transaction: false })
                .then((item: AccessPointStatus) => {
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
                .then((item: AccessPointStatus) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (where: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.remove(await this.find({ where }))
                .then(() => {
                    resolve({ message: 'success' })
                })
                .catch((error: any) => {
                    console.log('AccessPointStatus delete failed', error)
                    resolve({ message: 'AccessPointStatus delete failed' })
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
