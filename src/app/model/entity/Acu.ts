import {
    Entity,
    Column,
    OneToMany,
    DeleteDateColumn
} from 'typeorm'

import { acuStatus } from '../../enums/acuStatus.enum'
import { networkValidation, interfaceValidation, timeValidation } from '../../functions/validator'
import { MainEntity } from './MainEntity'
import { AccessPoint } from './AccessPoint'
import { ExtDevice } from './ExtDevice'
import { acuModel } from '../../enums/acuModel.enum'

import { minusResource } from '../../functions/minusResource'

@Entity('acu')
export class Acu extends MainEntity {
    @Column('varchar', { name: 'name', nullable: true })
    name: string | null

    @Column('bigint', { name: 'serial_number', nullable: true })
    serial_number: number

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('enum', { name: 'model', nullable: false, enum: acuModel })
    model: string

    @Column('enum', { name: 'status', nullable: false, enum: acuStatus, default: acuStatus.PENDING })
    status: acuStatus

    @Column('varchar', { name: 'fw_version', nullable: true })
    fw_version: string | null

    @Column('boolean', { name: 'maintain_update_manual', default: true })
    maintain_update_manual: boolean

    @Column('boolean', { name: 'shared_resource_mode', default: false })
    shared_resource_mode: boolean

    @Column('longtext', { name: 'network', nullable: true })
    network: string | null

    @Column('longtext', { name: 'interface', nullable: true })
    interface: string | null

    @Column('longtext', { name: 'time', nullable: true })
    time: string | null

    @Column('varchar', { name: 'session_id', nullable: true })
    session_id: string | null

    @Column('varchar', { name: 'username', nullable: true })
    username: string | null

    @Column('varchar', { name: 'password', nullable: true })
    password: string | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @OneToMany(type => AccessPoint, access_point => access_point.acus)
    access_points: AccessPoint[];

    @OneToMany(type => ExtDevice, ext_device => ext_device.acus)
    ext_devices: ExtDevice[];

    public static async addItem (data: any) {
        const acu = new Acu()

        acu.name = data.name
        acu.description = data.note
        // acu.serial_number = data.serial_number
        acu.model = data.model // check or no ??
        acu.status = acuStatus.PENDING
        acu.fw_version = data.fw_version
        acu.company = data.company

        return new Promise((resolve, reject) => {
            if (data.time) {
                const check_time = timeValidation(data.time)
                if (!check_time) {
                    reject(check_time)
                } else {
                    acu.time = JSON.stringify(data.time)
                }
            }
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
        const acu = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, acu)

        if ('name' in data) acu.name = data.name
        if ('description' in data) acu.description = data.description
        // if ('serial_number' in data) acu.serial_number = data.serial_number
        if ('model' in data) acu.model = data.model
        if ('status' in data) acu.status = data.status
        if ('fw_version' in data) acu.fw_version = data.fw_version
        if ('maintain_update_manual' in data) acu.maintain_update_manual = data.maintain_update_manual
        if ('shared_resource_mode' in data) acu.shared_resource_mode = data.shared_resource_mode
        if ('network' in data) acu.network = data.network
        if ('interface' in data) acu.interface = data.interface

        if (!acu) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            if (data.network) {
                const check_network = networkValidation(data.network)
                if (!check_network) {
                    reject(check_network)
                } else {
                    acu.network = JSON.stringify(data.network)
                }
            }
            if (data.interface) {
                const check_interface = interfaceValidation(data.interface)
                if (!check_interface) {
                    reject(check_interface)
                } else {
                    acu.interface = JSON.stringify(data.interface)
                }
            }
            if (data.time) {
                const check_time = timeValidation(data.time)
                if (!check_time) {
                    reject(check_time)
                } else {
                    acu.time = JSON.stringify(data.time)
                }
            }
            // if (data.maintain) {
            //     const check_maintain = maintainValidation(data.time)
            //     if (!check_maintain) {
            //         reject(check_maintain)
            //     }
            // }

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

    public static async getItem (where: any, relations?: Array<string>): Promise<Acu> {
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

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        minusResource(this.name, data.company)
                        const access_points: any = await AccessPoint.getAllItems({ where: { acu: { '=': data.id } }/* , relations: ['readers', 'access_rules'] */ })
                        for (const access_point of access_points) {
                            AccessPoint.destroyItem({ id: access_point.id, company: access_point.company })
                        }
                        const ext_devices: any = await ExtDevice.getAllItems({ where: { acu: { '=': data.id } } })
                        for (const ext_device of ext_devices) {
                            ExtDevice.destroyItem({ id: ext_device.id, company: ext_device.company })
                        }
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
            this.findByParams(
                {
                    ...params,
                    relations: params.relations ? params.relations : []
                })
                .then((items) => {
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
