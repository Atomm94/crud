import { Company } from './Company'
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { cameraDeviceConnType } from '../../cameraIntegration/enums/camerDevice.enum'
import { MainEntity } from './MainEntity'
import { UniviewDeviceType } from '../../cameraIntegration/enums/univiewDeviceType'

@Entity('camera_device')
export class CameraDevice extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('enum', { name: 'connection_type', nullable: false, enum: cameraDeviceConnType })
    connection_type: string

    @Column('enum', { name: 'device_type', nullable: false, enum: UniviewDeviceType })
    device_type: string

    @Column('varchar', { name: 'serial_number', nullable: true })
    serial_number: string | null

    @Column('varchar', { name: 'domain', nullable: true })
    domain: string | null

    @Column('int', { name: 'port', nullable: true })
    port: number | null

    @Column('varchar', { name: 'username', nullable: false })
    username: string

    @Column('varchar', { name: 'password', nullable: false })
    password: string

    @Column('int', { name: 'company', nullable: false })
    company: number

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('longtext', { name: 'cameras', nullable: true })
    cameras: string

    @Column('varchar', { name: 'type', default: 'uniview' })
    type: string

    @ManyToOne(() => Company, company => company.camera_devices)
    @JoinColumn({ name: 'company' })
    companies: Company

    public static async addItem (data: CameraDevice): Promise<CameraDevice> {
        const cameraDevice = new CameraDevice()
        cameraDevice.name = data.name
        cameraDevice.company = data.company
        cameraDevice.username = data.username
        cameraDevice.password = data.password
        cameraDevice.connection_type = data.connection_type
        cameraDevice.type = data.type
        cameraDevice.device_type = data.device_type

        if ('serial_number' in data) cameraDevice.serial_number = data.serial_number
        if ('domain' in data) cameraDevice.domain = data.domain
        if ('port' in data) cameraDevice.port = data.port
        if ('cameras' in data) {
            const cameras = JSON.stringify(data.cameras)
            cameraDevice.cameras = cameras
        }

        return new Promise((resolve, reject) => {
            this.save(cameraDevice)
                .then((item: CameraDevice) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CameraDevice): Promise<{ new: CameraDevice, old: CameraDevice}> {
        const cameraDevice = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, cameraDevice)

        cameraDevice.name = data.name
        cameraDevice.company = data.company
        cameraDevice.username = data.username
        cameraDevice.password = data.password
        cameraDevice.connection_type = data.connection_type

        if ('serial_number' in data) cameraDevice.serial_number = data.serial_number
        if ('domain' in data) cameraDevice.domain = data.domain
        if ('port' in data) cameraDevice.port = data.port
        if ('device_type' in data) cameraDevice.device_type = data.device_type
        if ('cameras' in data) {
            const cameras = JSON.stringify(data.cameras)
            cameraDevice.cameras = cameras
        }

        return new Promise((resolve, reject) => {
            this.save(cameraDevice)
                .then((item: CameraDevice) => {
                    resolve({
                        old: oldData,
                        new: cameraDevice
                    })
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
                .then((item: CameraDevice) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (id: number) {
        const itemId: number = id
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.remove(await this.findOneOrFail(itemId))
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
