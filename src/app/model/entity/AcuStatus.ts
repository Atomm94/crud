import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    OneToOne
    // ManyToOne,
    // OneToMany,
    // JoinColumn
} from 'typeorm'
import { Acu, Company } from '.'
import { acuConnectionMode } from '../../enums/acuConnectionMode.enum'
import { acuConnectionType } from '../../enums/acuConnectionType.enum'
import { AccessPointStatus } from './AccessPointStatus'

import { MainEntity } from './MainEntity'
// import { Company } from './Company'
// import { Acu } from './Acu'

@Entity('acu_status')
export class AcuStatus extends MainEntity {
    @Column('int', { name: 'acu', nullable: false, unique: true })
    acu: number

    @Column('bigint', { name: 'serial_number', nullable: false })
    serial_number: number

    @Column('bigint', { name: 'timestamp', nullable: false })
    timestamp: number | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('varchar', { name: 'fw_version', nullable: true })
    fw_version: string | null

    @Column('varchar', { name: 'rev', nullable: true }) // HW Ver
    rev: string | null

    @Column('varchar', { name: 'api_ver', nullable: true }) // API Ver
    api_ver: string | null

    @Column('varchar', { name: 'acu_comment', nullable: true }) // ACU Comment
    acu_comment: string | null

    @Column('enum', { name: 'connection_type', nullable: false, enum: acuConnectionType, default: acuConnectionType.ETHERNET })
    connection_type: acuConnectionType

    @Column('varchar', { name: 'ip_address', nullable: true })
    ip_address: string | null

    @Column('varchar', { name: 'gateway', nullable: true })
    gateway: string | null

    @Column('varchar', { name: 'subnet_mask', nullable: true })
    subnet_mask: string | null

    @Column('varchar', { name: 'dns_server', nullable: true })
    dns_server: string | null

    @Column('varchar', { name: 'ssid', nullable: true })
    ssid: string | null

    @Column('enum', { name: 'connection_mod', nullable: false, enum: acuConnectionMode, default: acuConnectionMode.FIXED })
    connection_mod: acuConnectionMode

    @OneToOne(type => Acu, acu => acu.acu_statuses)
    @JoinColumn({ name: 'acu' })
    acus: Acu;

    @ManyToOne(type => Company, company => company.acu_statuses)
    @JoinColumn({ name: 'company' })
    companies: Company;

    public static async addItem (data: AcuStatus): Promise<AcuStatus> {
        const acuStatus = new AcuStatus()

        acuStatus.acu = data.acu
        acuStatus.serial_number = data.serial_number
        acuStatus.timestamp = data.timestamp ? data.timestamp : new Date().getTime()
        acuStatus.company = data.company
        if ('fw_version' in data) acuStatus.fw_version = data.fw_version
        if ('rev' in data) acuStatus.rev = data.rev
        if ('api_ver' in data) acuStatus.api_ver = data.api_ver
        if ('acu_comment' in data) acuStatus.acu_comment = data.acu_comment
        if ('connection_type' in data) acuStatus.connection_type = data.connection_type
        if ('ip_address' in data) acuStatus.ip_address = data.ip_address
        if ('gateway' in data) acuStatus.gateway = data.gateway
        if ('subnet_mask' in data) acuStatus.subnet_mask = data.subnet_mask
        if ('dns_server' in data) acuStatus.dns_server = data.dns_server
        if ('connection_mod' in data) acuStatus.connection_mod = data.connection_mod
        if ('ssid' in data) acuStatus.ssid = data.ssid

        return new Promise((resolve, reject) => {
            this.save(acuStatus, { transaction: false })
                .then((item: AcuStatus) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AcuStatus): Promise<{ [key: string]: any }> {
        const acuStatus = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, acuStatus)

        acuStatus.timestamp = new Date().getTime()
        if ('fw_version' in data) acuStatus.fw_version = data.fw_version
        if ('rev' in data) acuStatus.rev = data.rev
        if ('api_ver' in data) acuStatus.api_ver = data.api_ver
        if ('acu_comment' in data) acuStatus.acu_comment = data.acu_comment
        if ('connection_type' in data) acuStatus.connection_type = data.connection_type
        if ('ip_address' in data) acuStatus.ip_address = data.ip_address
        if ('gateway' in data) acuStatus.gateway = data.gateway
        if ('subnet_mask' in data) acuStatus.subnet_mask = data.subnet_mask
        if ('dns_server' in data) acuStatus.dns_server = data.dns_server
        if ('connection_mod' in data) acuStatus.connection_mod = data.connection_mod
        if ('ssid' in data) acuStatus.ssid = data.ssid

        if (!acuStatus) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(acuStatus, { transaction: false })
                .then((item: AcuStatus) => {
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
                .then((item: AcuStatus) => {
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
            const entity = await this.findOne({ acu: data.acu })
            if (entity) {
                this.remove(entity)
                    .then(async () => {
                        AccessPointStatus.destroyItem({ acu: data.acu })
                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        console.log('AcuStatus delete failed', error)
                        resolve({ message: 'AcuStatus delete failed' })
                    })
            } else {
                resolve({ message: 'success' })
            }
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
