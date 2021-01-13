import {
    Entity,
    Column
} from 'typeorm'

import { acuStatus } from '../../enums/acuStatus.enum'
import { acuConnectionType } from '../../enums/acuConnectionType.enum'
import { MainEntity } from './MainEntity'

@Entity('acu')
export class Acu extends MainEntity {
    @Column('varchar', { name: 'name', nullable: true })
    name: string | null

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('varchar', { name: 'model', nullable: false })
    model: string

    @Column('enum', { name: 'status', nullable: false, enum: acuStatus, default: acuStatus.PENDING })
    status: acuStatus

    @Column('varchar', { name: 'ip_address', nullable: true })
    ip_address: string | null

    @Column('boolean', { name: 'cloud_status', default: false })
    cloud_status: boolean

    @Column('varchar', { name: 'fw_version', nullable: true })
    fw_version: string | null

    @Column('boolean', { name: 'shared_resource_mode', default: false })
    shared_resource_mode: boolean

    @Column('enum', { name: 'connection_type', nullable: false, enum: acuConnectionType, default: acuConnectionType.ETHERNET })
    connection_type: acuConnectionType

    @Column('longtext', { name: 'network', nullable: true })
    network: string | null

    @Column('longtext', { name: 'interface', nullable: true })
    interface: string | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    public static async addItem (data: Acu) {
        const acu = new Acu()

        acu.name = data.name
        acu.description = data.description
        acu.model = data.model
        acu.status = data.status
        acu.ip_address = data.ip_address
        acu.cloud_status = data.cloud_status
        acu.fw_version = data.fw_version
        acu.shared_resource_mode = data.shared_resource_mode
        acu.connection_type = data.connection_type
        acu.network = data.network
        acu.interface = data.interface
        acu.company = data.company

        return new Promise((resolve, reject) => {
            this.save(acu)
                .then((item: Acu) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Acu): Promise<{ [key: string]: any }> {
        const acu = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, acu)

        if ('name' in data) acu.name = data.name
        if ('description' in data) acu.description = data.description
        if ('model' in data) acu.model = data.model
        if ('status' in data) acu.status = data.status
        if ('ip_address' in data) acu.ip_address = data.ip_address
        if ('cloud_status' in data) acu.cloud_status = data.cloud_status
        if ('fw_version' in data) acu.fw_version = data.fw_version
        if ('shared_resource_mode' in data) acu.shared_resource_mode = data.shared_resource_mode
        if ('connection_type' in data) acu.connection_type = data.connection_type
        if ('network' in data) acu.network = data.network
        if ('interface' in data) acu.interface = data.interface

        if (!acu) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(acu)
                .then((item: Acu) => {
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
                .then((item: Acu) => {
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
