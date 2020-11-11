import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { PacketType } from './PacketType'
import { Company } from './Company'

@Entity('packet')
export class Packet extends MainEntity {
    @Column('varchar', { name: 'name', unique: true })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'packet_type' })
    packet_type: number

    @Column('boolean', { name: 'pay_type', default: true })
    pay_type: boolean

    @Column('float', { name: 'price', nullable: true })
    price: number | null

    @Column('json', { name: 'pay_terms', nullable: true })
    pay_terms: JSON | null

    @Column('json', { name: 'extra_settings', nullable: true })
    extra_settings: JSON | null

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    @ManyToOne(type => PacketType, packetType => packetType.packets)
    @JoinColumn({ name: 'packet_type' })
    packet_types: PacketType;

    @OneToOne(type => Company, company => company.product, { nullable: true })
    packets: Packet[] | null;

    public static async addItem (data: Packet) {
        const packet = new Packet()

        packet.name = data.name
        packet.description = data.description
        packet.packet_type = data.packet_type
        packet.pay_type = data.pay_type
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

    public static async updateItem (data: Packet) {
        const packet = await this.findOneOrFail(data.id)

        if ('name' in data) packet.name = data.name
        if ('description' in data) packet.description = data.description
        if ('packet_type' in data) packet.packet_type = data.packet_type
        if ('pay_type' in data) packet.pay_type = data.pay_type
        if ('price' in data) packet.price = data.price
        if ('pay_terms' in data) packet.pay_terms = data.pay_terms
        if ('status' in data) packet.status = data.status
        if ('extra_settings' in data) packet.extra_settings = data.extra_settings

        if (!packet) return { status: 400, messsage: 'Item not found' }
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

    public static async getItem (id: number, relations?: Array<string>) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: { id: itemId },
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
