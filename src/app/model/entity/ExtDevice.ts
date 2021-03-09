import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Acu } from './Acu'
import { expBrd } from '../../enums/expBrd.enum'

@Entity('ext_device')
export class ExtDevice extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('int', { name: 'acu', nullable: false })
    acu: number

    @Column('enum', { name: 'ext_board', nullable: false, enum: expBrd })
    ext_board: string

    @Column('int', { name: 'baud_rate', nullable: true })
    baud_rate: number

    @Column('int', { name: 'uart_mode', nullable: true })
    uart_mode: number

    @Column('varchar', { name: 'address', nullable: false })
    address: string

    @Column('int', { name: 'port', nullable: false })
    port: number

    @Column('int', { name: 'protocol', nullable: false })
    protocol: number

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Acu, acu => acu.ext_devices, { nullable: false })
    @JoinColumn({ name: 'acu' })
    acus: Acu;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: ExtDevice) {
        const extDevice = new ExtDevice()

        if ('name' in data) extDevice.name = data.name
        extDevice.acu = data.acu
        if ('ext_board' in data) extDevice.ext_board = data.ext_board
        if ('baud_rate' in data) extDevice.baud_rate = data.baud_rate
        if ('address' in data) extDevice.address = data.address
        if ('port' in data) extDevice.port = data.port
        if ('uart_mode' in data) extDevice.uart_mode = data.uart_mode
        if ('protocol' in data) extDevice.protocol = data.protocol
        extDevice.company = data.company

        return new Promise((resolve, reject) => {
            this.save(extDevice)
                .then((item: ExtDevice) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: ExtDevice): Promise<{ [key: string]: any }> {
        const extDevice = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, extDevice)

        if ('name' in data) extDevice.name = data.name
        if ('acu' in data) extDevice.acu = data.acu
        if ('ext_board' in data) extDevice.ext_board = data.ext_board
        if ('baud_rate' in data) extDevice.baud_rate = data.baud_rate
        if ('address' in data) extDevice.address = data.address
        if ('port' in data) extDevice.port = data.port
        if ('uart_mode' in data) extDevice.uart_mode = data.uart_mode
        if ('protocol' in data) extDevice.protocol = data.protocol

        if (!extDevice) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(extDevice)
                .then((item: ExtDevice) => {
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
                .then((item: ExtDevice) => {
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
