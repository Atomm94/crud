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

        return new Promise((resolve, reject) => {
            this.save(acuStatus)
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

        if (!acuStatus) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(acuStatus)
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
            this.remove(await this.findOneOrFail({ acu: data.acu }))
                .then(async () => {
                    AccessPointStatus.destroyItem({ acu: data.acu })
                    resolve({ message: 'success' })
                })
                .catch((error: any) => {
                    console.log('AcuStatus delete failed', error)
                    resolve({ message: 'AcuStatus delete failed' })
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
