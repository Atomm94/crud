import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { CameraSet } from './CameraSet'
import { Camera } from './Camera'
import { MainEntity } from './MainEntity'

@Entity('camera_set_to_camera')
export class CameraSetToCamera extends MainEntity {
    @Column('int', { name: 'camera_set_id', nullable: false })
    camera_set_id: number

    @Column('int', { name: 'camera_id', nullable: false })
    camera_id: number

    @Column('boolean', { name: 'main', nullable: false, default: false })
    main: boolean

    @ManyToOne(() => CameraSet, cameraSet => cameraSet.camera_set_cameras/* , { primary: true, onDelete: 'CASCADE' } */)
    @JoinColumn({ name: 'camera_set_id' })
    camera_sets: CameraSet;

    @ManyToOne(() => Camera, camera => camera.camera_camera_sets/* , { primary: true, onDelete: 'CASCADE' } */)
    @JoinColumn({ name: 'camera_id' })
    cameras: Camera;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: CameraSetToCamera): Promise<CameraSetToCamera> {
        const cameraSet = new CameraSetToCamera()

        cameraSet.camera_set_id = data.camera_set_id
        cameraSet.camera_id = data.camera_id
        cameraSet.main = data.main

        return new Promise((resolve, reject) => {
            this.save(cameraSet)
                .then((item: CameraSetToCamera) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CameraSetToCamera): Promise<{ [key: string]: any }> {
        const cameraSetToCamera = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, cameraSetToCamera)

        if ('main' in data) cameraSetToCamera.main = data.main

        if (!cameraSetToCamera) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cameraSetToCamera)
                .then((item: CameraSetToCamera) => {
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
}
