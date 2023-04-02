import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('camera')
export class Camera extends MainEntity {
    @Column('int', { name: 'service_id', nullable: false })
    service_id: number

    @Column('varchar', { name: 'service_name', nullable: true })
    service_name: string | null

    @Column('varchar', { name: 'name', nullable: true })
    name: string | null

    @Column('int', { name: 'channel_type', nullable: true })
    channel_type: number | null

    @Column('int', { name: 'status', nullable: true })
    status: number | null

    @Column('int', { name: 'stream_nums', nullable: true })
    stream_nums: number | null

    @Column('int', { name: 'device_type', nullable: true })
    device_type: number | null

    @Column('int', { name: 'allow_distribution', nullable: true })
    allow_distribution: number | null

    @Column('int', { name: 'add_type', nullable: true })
    add_type: number | null

    @Column('int', { name: 'access_protocol', nullable: true })
    access_protocol: number | null

    @Column('int', { name: 'off_reason', nullable: true })
    off_reason: number | null

    @Column('int', { name: 'remote_index', nullable: true })
    remote_index: number | null

    @Column('varchar', { name: 'manufacturer', nullable: true })
    manufacturer: string | null

    @Column('varchar', { name: 'device_model', nullable: true })
    device_model: string | null

    @Column('varchar', { name: 'gbid', nullable: true })
    gbid: string | null

    @Column('longtext', { name: 'address_info', nullable: true })
    address_info: string | null

    @Column('int', { name: 'is_poe_port', nullable: true })
    is_poe_port: number | null

    @Column('int', { name: 'poe_status', nullable: true })
    poe_status: number | null

    @Column('int', { name: 'camera_device', nullable: false })
    camera_device: number

    @Column('boolean', { name: 'hidden', default: false })
    hidden: boolean

    @Column('int', { name: 'company', nullable: false })
    company: number

    public static async addItem (data: Camera) {
        const camera = new Camera()

        camera.service_id = data.service_id
        camera.service_name = data.service_name
        camera.name = data.name
        camera.channel_type = data.channel_type
        camera.status = data.status
        camera.stream_nums = data.stream_nums
        camera.device_type = data.device_type
        camera.allow_distribution = data.allow_distribution
        camera.add_type = data.add_type
        camera.access_protocol = data.access_protocol
        camera.off_reason = data.off_reason
        camera.remote_index = data.remote_index
        camera.manufacturer = data.manufacturer
        camera.device_model = data.device_model
        camera.gbid = data.gbid
        camera.address_info = data.address_info ? JSON.stringify(data.address_info) : null
        camera.is_poe_port = data.is_poe_port
        camera.poe_status = data.poe_status
        camera.camera_device = data.camera_device
        camera.company = data.company

        return new Promise((resolve, reject) => {
            this.save(camera)
                .then((item: Camera) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Camera) {
        const camera = await this.findOneOrFail({ where: { id: data.id } })

        if ('name' in data) camera.name = data.name
        if ('hidden' in data) camera.hidden = data.hidden

        if (!camera) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(camera)
                .then((item: Camera) => {
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
                .then((item: Camera) => {
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
            this.delete(await this.findOneOrFail({ where: { id: itemId } }))
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
