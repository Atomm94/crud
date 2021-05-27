import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { readerTypes } from '../../enums/readerTypes'
import { wiegandTypes } from '../../enums/wiegandTypes'
import { AccessPoint } from './AccessPoint'
import { readerModes } from '../../enums/readerModes'
import { readerDirections } from '../../enums/readerDirection'

@Entity('reader')
export class Reader extends MainEntity {
    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @Column('enum', { name: 'type', nullable: false, enum: readerTypes })
    type: string

    @Column('int', { name: 'port', nullable: false })
    port: number

    @Column('enum', { name: 'wg_type', nullable: true, enum: wiegandTypes })
    wg_type: number

    @Column('longtext', { name: 'osdp_data', nullable: true })
    osdp_data: string | null

    @Column('int', { name: 'osdp_address', nullable: true })
    osdp_address: number | null

    @Column('enum', { name: 'mode', nullable: false, default: 0, enum: readerModes })
    mode: number

    @Column('enum', { name: 'direction', nullable: false, default: 0, enum: readerDirections })
    direction: number

    @Column('boolean', { name: 'beep', default: false })
    beep: boolean

    @Column('boolean', { name: 'crc', default: false })
    crc: boolean

    @Column('boolean', { name: 'reverse', default: false })
    reverse: boolean

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AccessPoint, accessPoint => accessPoint.readers)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: Reader) {
        const reader = new Reader()

        reader.access_point = data.access_point
        reader.type = data.type
        reader.port = data.port
        if ('wg_type' in data) reader.wg_type = data.wg_type
        if ('mode' in data) reader.mode = data.mode
        if ('direction' in data) reader.direction = data.direction
        if ('beep' in data) reader.beep = data.beep
        if ('crc' in data) reader.crc = data.crc
        if ('reverse' in data) reader.reverse = data.reverse
        reader.company = data.company

        return new Promise((resolve, reject) => {
            this.save(reader)
                .then((item: Reader) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Reader): Promise<{ [key: string]: any }> {
        const reader = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, reader)

        if ('port' in data) reader.port = data.port
        if ('wg_type' in data) reader.wg_type = data.wg_type
        if ('mode' in data) reader.mode = data.mode
        if ('direction' in data) reader.direction = data.direction
        if ('beep' in data) reader.beep = data.beep
        if ('crc' in data) reader.crc = data.crc
        if ('reverse' in data) reader.reverse = data.reverse

        if (!reader) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(reader)
                .then((item: Reader) => {
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
                .then((item: Reader) => {
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
