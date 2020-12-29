import {
    Entity,
    Column,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { PacketType } from './PacketType'
import { Company } from './Company'

@Index('name|deleteDate', ['name', 'deleteDate'], { unique: true })

@Entity('packet')
export class Packet extends MainEntity {
    @Column('varchar', { name: 'name' })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'packet_type' })
    packet_type: number

    @Column('boolean', { name: 'free', default: true })
    free: boolean

    @Column('float', { name: 'price', nullable: true })
    price: number | null

    @Column('longtext', { name: 'pay_terms', nullable: true })
    pay_terms: string | null

    @Column('longtext', { name: 'extra_settings', nullable: false })
    extra_settings: string

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @ManyToOne(type => PacketType, packetType => packetType.packets)
    @JoinColumn({ name: 'packet_type' })
    packet_types: PacketType;

    @OneToMany(type => Company, company => company.packet, { nullable: true })
    packets: Packet[] | null;

    public static async addItem (data: Packet) {
        const packet = new Packet()

        packet.name = data.name
        packet.description = data.description
        packet.packet_type = data.packet_type
        packet.free = data.free
        packet.price = data.price
        packet.pay_terms = data.pay_terms
        packet.status = data.status
        packet.extra_settings = data.extra_settings

        return new Promise((resolve, reject) => {
            this.save(packet)
                .then((item: Packet) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Packet): Promise<{ [key: string]: any }> {
        const packet = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, packet)

        if ('name' in data) packet.name = data.name
        if ('description' in data) packet.description = data.description
        if ('packet_type' in data) packet.packet_type = data.packet_type
        if ('free' in data) packet.free = data.free
        if ('price' in data) packet.price = data.price
        if ('pay_terms' in data) packet.pay_terms = data.pay_terms
        if ('status' in data) packet.status = data.status
        if ('extra_settings' in data) packet.extra_settings = data.extra_settings

        if (!packet) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(packet)
                .then((item: Packet) => {
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

    public static async getItem (id: number, where: any, relations?: Array<string>) {
        const itemId: number = id
        where.id = itemId
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: Packet) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: { id: number }) {
        const itemId: number = +data.id
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
              this.remove(await this.findByIds([itemId]))
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
