import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Packet } from './Packet'
import { Company } from './Company'

@Entity('packet_type')
export class PacketType extends MainEntity {
    @Column('varchar', { name: 'name', unique: true })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    @OneToMany(type => Packet, packet => packet.packet_types)
    packets: Packet[];

    @OneToMany(type => Company, company => company.packet_type)
    companies: Company[];

    public static async addItem (data: PacketType) {
        const packetType = new PacketType()

        packetType.name = data.name
        packetType.status = data.status
        packetType.description = data.description

        return new Promise((resolve, reject) => {
            this.save(packetType)
                .then((item: PacketType) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: PacketType) {
        const packetType = await this.findOneOrFail(data.id)

        if ('name' in data) packetType.name = data.name
        if ('status' in data) packetType.status = data.status
        if ('description' in data) packetType.description = data.description

        if (!packetType) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(packetType)
                .then((item: PacketType) => {
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
                .then((item: PacketType) => {
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
