import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AccessPoint } from './AccessPoint'
import { Company } from './Company'
import { MainEntity } from './MainEntity'

@Entity('camera_set')
export class CameraSet extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('int', { name: 'before_event', nullable: false })
    before_event: number

    @Column('int', { name: 'after_event', nullable: false })
    after_event: number

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @ManyToOne(() => Company, company => company.cameraSets)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @ManyToOne(() => AccessPoint, access_point => access_point.cameraSets)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint

    public static async addItem (data: CameraSet): Promise<CameraSet> {
        const cameraSet = new CameraSet()

        cameraSet.name = data.name
        cameraSet.before_event = data.before_event
        cameraSet.after_event = data.after_event
        cameraSet.company = data.company
        cameraSet.access_point = data.access_point

        return new Promise((resolve, reject) => {
            this.save(cameraSet)
                .then((item: CameraSet) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CameraSet): Promise<{ [key: string]: any }> {
        const cameraSet = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, cameraSet)

        if ('name' in data) cameraSet.name = data.name
        if ('before_event' in data) cameraSet.before_event = data.before_event
        if ('after_event' in data) cameraSet.after_event = data.after_event
        if ('company' in data) cameraSet.company = data.company
        if ('access_point' in data) cameraSet.access_point = data.access_point

        if (!cameraSet) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cameraSet)
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
}
