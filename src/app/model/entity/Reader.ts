import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
    OneToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { readerTypes } from '../../enums/readerTypes'
import { wiegandTypes } from '../../enums/wiegandTypes'
import { AccessPoint } from './AccessPoint'
import { readerModes } from '../../enums/readerModes'
import { readerDirections } from '../../enums/readerDirection'

import { minusResource } from '../../functions/minusResource'
import { AccessPointZone } from './AccessPointZone'
import { Acu } from '.'
@Entity('reader')
export class Reader extends MainEntity {
    @Column('int', { name: 'access_point', nullable: true })
    access_point: number | null

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

    @Column('boolean', { name: 'enable_buzzer', default: false })
    enable_buzzer: boolean

    @Column('boolean', { name: 'enable_crc', default: false })
    enable_crc: boolean

    @Column('boolean', { name: 'reverse_byte_order', default: false })
    reverse_byte_order: boolean

    @Column('int', { name: 'leaving_zone', nullable: true })
    leaving_zone: number | null

    @Column('int', { name: 'came_to_zone', nullable: true })
    came_to_zone: number | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AccessPoint, accessPoint => accessPoint.readers)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint;

    @ManyToOne(type => AccessPointZone, leavingZone => leavingZone.leaving_readers)
    @JoinColumn({ name: 'leaving_zone' })
    leaving_zones: AccessPointZone;

    @ManyToOne(type => AccessPointZone, cameToZone => cameToZone.caming_readers)
    @JoinColumn({ name: 'came_to_zone' })
    came_to_zones: AccessPointZone;

    @OneToOne(type => Acu, acu => acu.readers, { nullable: true })
    acus: Acu | null;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false
    public static fields_that_used_in_sending: Array<string> = [
        'wg_type',
        'direction',
        'reverse_byte_order',
        'port',
        'enable_buzzer',
        'enable_crc',
        'mode',
        'osdp_address',
        'leaving_zone',
        'came_to_zone'
    ]

    public static OSDP_fields_that_used_in_sending: Array<string> = [
        'direction',
        'baud_rate',
        'card_data_format_flags',
        'keypad_mode',
        'configuration',
        // 'led_mode',
        'offline_mode',
        'enable_osdp_secure_channel',
        'enable_osdp_tracing'
    ]

    public static required_fields_for_sending: Array<string> = [
        'access_point',
        'port',
        'wg_type',
        'direction',
        'osdp_address',
        'baud_rate',
        'leaving_zone',
        'came_to_zone'
    ]

    public static async addItem (data: Reader) {
        const reader = new Reader()

        reader.access_point = data.access_point
        reader.type = data.type
        reader.port = data.port
        if ('wg_type' in data) reader.wg_type = data.wg_type
        if ('mode' in data) reader.mode = data.mode
        if ('direction' in data) reader.direction = data.direction
        if ('enable_buzzer' in data) reader.enable_buzzer = data.enable_buzzer
        if ('enable_crc' in data) reader.enable_crc = data.enable_crc
        if ('reverse_byte_order' in data) reader.reverse_byte_order = data.reverse_byte_order
        if ('osdp_data' in data) reader.osdp_data = (data.osdp_data && typeof data.osdp_data === 'object') ? JSON.stringify(data.osdp_data) : data.osdp_data
        if ('osdp_address' in data) reader.osdp_address = data.osdp_address
        if ('leaving_zone' in data) reader.leaving_zone = data.leaving_zone
        if ('came_to_zone' in data) reader.came_to_zone = data.came_to_zone
        reader.company = data.company

        return new Promise((resolve, reject) => {
            this.save(reader, { transaction: false })
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

        if ('type' in data) reader.type = data.type
        if ('port' in data) reader.port = data.port
        if ('wg_type' in data) reader.wg_type = data.wg_type
        if ('mode' in data) reader.mode = data.mode
        if ('direction' in data) reader.direction = data.direction
        if ('enable_buzzer' in data) reader.enable_buzzer = data.enable_buzzer
        if ('enable_crc' in data) reader.enable_crc = data.enable_crc
        if ('reverse_byte_order' in data) reader.reverse_byte_order = data.reverse_byte_order
        if ('osdp_data' in data) reader.osdp_data = (typeof data.osdp_data === 'string') ? data.osdp_data : JSON.stringify(data.osdp_data)
        if ('osdp_address' in data) reader.osdp_address = data.osdp_address
        if ('leaving_zone' in data) reader.leaving_zone = data.leaving_zone
        if ('came_to_zone' in data) reader.came_to_zone = data.came_to_zone

        if (!reader) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(reader, { transaction: false })
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
            const where: any = {
                id: data.id
            }
            if (data.company) where.company = data.company
            this.findOneOrFail(where).then((data: any) => {
                this.softRemove(data)
                    .then(() => {
                        minusResource(this.name, data.company)
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
