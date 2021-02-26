import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './'
import { expBrd } from '../../enums/expBrd.enum'

@Entity('ext_device')
export class ExtDevice extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('int', { name: 'acu', nullable: false })
    acu: number

    @Column('enum', { name: 'ext_board', nullable: false, enum: expBrd })
    ext_board: string

    @Column('int', { name: 'baud_rate', default: false })
    baud_rate: number

    @Column('int', { name: 'uart_mode', nullable: false })
    uart_mode: number

    @Column('varchar', { name: 'address', nullable: false })
    address: string

    @Column('int', { name: 'port', nullable: false })
    port: number

    public static async addItem (data: ExtDevice) {
        const extDevice = new ExtDevice()

        extDevice.name = data.name
        extDevice.acu = data.acu
        extDevice.ext_board = data.ext_board
        extDevice.baud_rate = data.baud_rate
        extDevice.uart_mode = data.uart_mode
        extDevice.address = data.address
        extDevice.port = data.port

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

    public static async updateItem (data: ExtDevice) {
        const extDevice = await this.findOneOrFail(data.id)

        if ('name' in data) extDevice.name = data.name
        if ('acu' in data) extDevice.acu = data.acu
        if ('ext_board' in data) extDevice.ext_board = data.ext_board
        if ('baud_rate' in data) extDevice.baud_rate = data.baud_rate
        if ('uart_mode' in data) extDevice.uart_mode = data.uart_mode
        if ('address' in data) extDevice.address = data.address
        if ('port' in data) extDevice.port = data.port

        if (!extDevice) return { status: 400, messsage: 'Item not found' }
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

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail(itemId)
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
