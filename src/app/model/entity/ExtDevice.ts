import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Acu } from './Acu'
import { expBrd } from '../../enums/expBrd.enum'
import { extBrdInterface } from '../../enums/extBrdInterface.enum'
import { extBrdProtocol } from '../../enums/extBrdProtocol.enum'
import { expBrdBaudRate } from '../../enums/expBrdBaudRate.enum'

@Index('acu|interface|address|port', ['acu', 'interface', 'address', 'port'], { unique: true })

@Entity('ext_device')
export class ExtDevice extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('int', { name: 'acu', nullable: false })
    acu: number

    @Column('enum', { name: 'interface', nullable: false, enum: extBrdInterface })
    interface: string

    @Column('enum', { name: 'ext_board', nullable: false, enum: expBrd })
    ext_board: string

    @Column('enum', { name: 'baud_rate', nullable: false, enum: expBrdBaudRate })
    baud_rate: string

    @Column('varchar', { name: 'address', nullable: false })
    address: string

    @Column('int', { name: 'port', nullable: false })
    port: number

    @Column('enum', { name: 'protocol', nullable: false, enum: extBrdProtocol })
    protocol: number

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Acu, acu => acu.ext_devices, { nullable: false })
    @JoinColumn({ name: 'acu' })
    acus: Acu;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false
    resources: { input: Number; output: Number }

    public static async addItem (data: ExtDevice):Promise<ExtDevice> {
        const extDevice = new ExtDevice()

        if ('name' in data) extDevice.name = data.name
        extDevice.acu = data.acu
        extDevice.interface = data.interface
        if ('ext_board' in data) extDevice.ext_board = data.ext_board
        if ('baud_rate' in data) extDevice.baud_rate = data.baud_rate
        if ('address' in data) extDevice.address = data.address
        if ('port' in data) extDevice.port = data.port
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
        const extDevice = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, extDevice)

        if ('name' in data) extDevice.name = data.name
        if ('acu' in data) extDevice.acu = data.acu
        if ('interface' in data) extDevice.interface = data.interface
        if ('ext_board' in data) extDevice.ext_board = data.ext_board
        if ('baud_rate' in data) extDevice.baud_rate = data.baud_rate
        if ('address' in data) extDevice.address = data.address
        if ('port' in data) extDevice.port = data.port
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

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
                this.remove(data)
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
