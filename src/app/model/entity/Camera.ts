import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
    Index,
    OneToMany
} from 'typeorm'

import { MainEntityColumns } from './MainEntityColumns'
import { CameraDevice } from './CameraDevice'
import { CameraSet } from './CameraSet'
import { CameraSetToCamera } from './CameraSetToCamera'

@Index('camera_device|service_id|is_delete', ['camera_device', 'service_id', 'is_delete'], { unique: true })

@Entity('camera')
export class Camera extends MainEntityColumns {
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

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @ManyToOne(type => CameraDevice, cameraDevice => cameraDevice.cameras)
    @JoinColumn({ name: 'camera_device' })
    camera_devices: CameraDevice;

    // @ManyToMany(() => CameraSet, cameraSet => cameraSet.cameras)
    // camera_sets: CameraSet[];

    @OneToMany(type => CameraSetToCamera, cameraSetToCamera => cameraSetToCamera.cameras)
    camera_camera_sets: CameraSetToCamera[];

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: Camera) {
        const camera = new Camera()

        camera.service_id = data.service_id
        camera.service_name = data.service_name
        camera.name = data.service_name
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
            this.save(camera, { transaction: false })
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
        const oldData = Object.assign({}, camera)

        if ('service_id' in data) camera.service_id = data.service_id
        if ('service_name' in data) camera.service_name = data.service_name
        if ('name' in data) camera.name = data.service_name
        if ('channel_type' in data) camera.channel_type = data.channel_type
        if ('status' in data) camera.status = data.status
        if ('stream_nums' in data) camera.stream_nums = data.stream_nums
        if ('device_type' in data) camera.device_type = data.device_type
        if ('allow_distribution' in data) camera.allow_distribution = data.allow_distribution
        if ('add_type' in data) camera.add_type = data.add_type
        if ('access_protocol' in data) camera.access_protocol = data.access_protocol
        if ('off_reason' in data) camera.off_reason = data.off_reason
        if ('remote_index' in data) camera.remote_index = data.remote_index
        if ('manufacturer' in data) camera.manufacturer = data.manufacturer
        if ('device_model' in data) camera.device_model = data.device_model
        if ('gbid' in data) camera.gbid = data.gbid
        if ('address_info' in data) camera.address_info = data.address_info ? JSON.stringify(data.address_info) : null
        if ('is_poe_port' in data) camera.is_poe_port = data.is_poe_port
        if ('poe_status' in data) camera.poe_status = data.poe_status
        if ('name' in data) camera.name = data.name
        if ('hidden' in data) camera.hidden = data.hidden

        if (!camera) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(camera, { transaction: false })
                .then((item: Camera) => {
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
                .then((item: Camera) => {
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
                        const camera_data: any = await this.createQueryBuilder('camera')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()
                        camera_data.is_delete = (new Date()).getTime()
                        await this.save(camera_data, { transaction: false })

                        // const camera_sets: any = await CameraSet.getAllItems({ where: { company: { '=': data.company } } })

                        const camera_sets: CameraSet[] = await CameraSet.createQueryBuilder('camera_set')
                            .leftJoinAndSelect('camera_set.camera_set_cameras', 'camera_set_camera')
                            .where(`camera_set.company = '${data.company}'`)
                            .getMany()
                        for (const camera_set of camera_sets) {
                            const camera_set_cameras = camera_set.camera_set_cameras
                            for (let i = 0; i < camera_set_cameras.length; i++) {
                                const camera_set_camera = camera_set_cameras[i]
                                if (camera_set_camera.camera_id === data.id) {
                                    CameraSetToCamera.remove(await CameraSetToCamera.find({ where: { camera_set_id: camera_set.id, camera_id: data.id } }))
                                    camera_set_cameras.splice(i, 1)
                                    if (camera_set_camera.main && camera_set_cameras.length) {
                                        camera_set_cameras[0].main = true
                                        camera_set_cameras[0].save({ transaction: false })
                                            .then(() => { })
                                            .catch(() => { })
                                    }
                                }
                            }
                            // const _cameras = []
                            // for (const _camera of camera_set.cameras) {
                            //     if (_camera.id !== data.id) _cameras.push({ id: _camera.id } as Camera)
                            // }
                            // camera_set.cameras = _cameras
                            // camera_set.save({ transaction: false })
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
