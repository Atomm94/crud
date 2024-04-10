import { Company } from './Company'
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, Index } from 'typeorm'
import { cameraDeviceConnType } from '../../cameraIntegration/enums/camerDevice.enum'
import { MainEntityColumns } from './MainEntityColumns'
import { UniviewDeviceType } from '../../cameraIntegration/enums/univiewDeviceType'
import { Camera } from './Camera'

@Index('serial_number|company|is_delete', ['serial_number', 'company', 'is_delete'], { unique: true })
@Index('domain|port|company|is_delete', ['domain', 'port', 'company', 'is_delete'], { unique: true })

@Entity('camera_device')
export class CameraDevice extends MainEntityColumns {
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

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('varchar', { name: 'camera_type', default: 'uniview' })
    camera_type: string

    @ManyToOne(() => Company, company => company.camera_devices)
    @JoinColumn({ name: 'company' })
    companies: Company

    @OneToMany(type => Camera, camera => camera.camera_devices)
    cameras: Camera[];

    public static async addItem (data: CameraDevice): Promise<CameraDevice> {
        const cameraDevice = new CameraDevice()
        cameraDevice.name = data.name
        cameraDevice.company = data.company
        cameraDevice.username = data.username
        cameraDevice.password = data.password
        cameraDevice.connection_type = data.connection_type
        cameraDevice.camera_type = data.camera_type
        cameraDevice.device_type = data.device_type

        if ('serial_number' in data) cameraDevice.serial_number = data.serial_number
        if ('domain' in data) cameraDevice.domain = data.domain
        if ('port' in data) cameraDevice.port = data.port

        return new Promise((resolve, reject) => {
            this.save(cameraDevice, { transaction: false })
                .then((item: CameraDevice) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CameraDevice): Promise<{ new: CameraDevice, old: CameraDevice }> {
        const cameraDevice = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, cameraDevice)

        if ('name' in data) cameraDevice.name = data.name
        if ('username' in data) cameraDevice.username = data.username
        if ('password' in data) cameraDevice.password = data.password

        if ('serial_number' in data) cameraDevice.serial_number = data.serial_number
        if ('domain' in data) cameraDevice.domain = data.domain
        if ('port' in data) cameraDevice.port = data.port
        if ('device_type' in data) cameraDevice.device_type = data.device_type

        return new Promise((resolve, reject) => {
            this.save(cameraDevice, { transaction: false })
                .then((item: CameraDevice) => {
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

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({ where: { id: itemId } })
                .then((item: CameraDevice) => {
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
            const where: any = { id: data.id, company: data.company }
            this.findOneOrFail({ where }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        const camera_device_data: any = await this.createQueryBuilder('camera')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()
                        camera_device_data.is_delete = (new Date()).getTime()
                        await this.save(camera_device_data, { transaction: false })

                        const cameras: any = await Camera.getAllItems({ where: { camera_device: { '=': data.id } } })
                        for (const camera of cameras) {
                            await Camera.destroyItem({ id: camera.id, company: camera.company })
                        }
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
