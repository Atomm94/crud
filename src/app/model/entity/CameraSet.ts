import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AccessPoint } from './AccessPoint'
import { Company } from './Company'
import { MainEntity } from './MainEntity'
import { CameraSetToCamera } from './CameraSetToCamera'

@Index('access_point|company|is_delete', ['access_point', 'company', 'is_delete'], { unique: true })

@Entity('camera_set')
export class CameraSet extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string

    @Column('int', { name: 'before_event', nullable: false, default: 5 })
    before_event: number

    @Column('int', { name: 'after_event', nullable: false, default: 15 })
    after_event: number

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @ManyToOne(() => Company, company => company.cameraSets)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @ManyToOne(() => AccessPoint, access_point => access_point.camera_sets)
    @JoinColumn([{ name: 'access_point', referencedColumnName: 'id' }, { name: 'company', referencedColumnName: 'company' }])
    access_points: AccessPoint

    // @ManyToMany(() => Camera, camera => camera.camera_sets)
    // @JoinTable()
    // cameras: Camera[];

    @OneToMany(type => CameraSetToCamera, cameraSetToCamera => cameraSetToCamera.camera_sets)
    camera_set_cameras: CameraSetToCamera[];

    public static async addItem (data: CameraSet): Promise<CameraSet> {
        const cameraSet = new CameraSet()

        cameraSet.name = data.name
        cameraSet.before_event = data.before_event
        cameraSet.after_event = data.after_event
        cameraSet.company = data.company
        cameraSet.access_point = data.access_point
        if ('description' in data) cameraSet.description = data.description

        return new Promise((resolve, reject) => {
            this.save(cameraSet, { transaction: false })
                .then((item: CameraSet) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CameraSet): Promise<{ [key: string]: any }> {
        const cameraSet = await this.findOneOrFail({ where: { id: data.id, company: data.company } })
        const oldData = Object.assign({}, cameraSet)

        if ('name' in data) cameraSet.name = data.name
        if ('before_event' in data) cameraSet.before_event = data.before_event
        if ('after_event' in data) cameraSet.after_event = data.after_event
        if ('access_point' in data) cameraSet.access_point = data.access_point
        if ('description' in data) cameraSet.description = data.description

        // if ('cameras' in data) cameraSet.cameras = data.cameras

        if (!cameraSet) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cameraSet, { transaction: false })
                .then((item: CameraSet) => {
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
                .then((item: CameraSet) => {
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
                        const camera_set_data: any = await this.createQueryBuilder('camera')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()
                        camera_set_data.is_delete = (new Date()).getTime()
                        await this.save(camera_set_data, { transaction: false })

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
