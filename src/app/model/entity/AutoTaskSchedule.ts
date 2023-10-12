import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm'

import { MainEntity } from './index'
import { autoTaskStatus } from '../../enums/autoTaskStatus.enum'
import { reactionType } from '../../enums/reactionType.enum'
import { AccessPoint } from './AccessPoint'
import { Acu } from './Acu'
@Index('access_point', ['access_point'], { unique: true })
@Entity('auto_task_schedule')
export class AutoTaskSchedule extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @Column('longtext', { name: 'reaction_access_points', nullable: false })
    reaction_access_points: string

    @Column('int', { name: 'acu', nullable: false })
    acu: number

    @Column('enum', { name: 'reaction_type', default: reactionType.MANAGEMENT_OF_ACCESS_POINTS, enum: reactionType })
    reaction_type: string

    @Column('int', { name: 'reaction', nullable: false })
    reaction: number

    @Column('longtext', { name: 'conditions', nullable: true })
    conditions: string

    @Column('enum', { name: 'condition', default: autoTaskStatus.PENDING, enum: autoTaskStatus })
    condition: string

    // @Column('enum', { name: 'condition', default: autoTaskStatus.PENDING, enum: autoTaskStatus })
    // condition: string

    @Column('boolean', { name: 'enable', default: true })
    enable: boolean

    @Column('boolean', { name: 'one_time', default: false })
    one_time: boolean

    @Column('boolean', { name: 'status', default: false })
    status: boolean

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AccessPoint, access_point => access_point.auto_task_schedules)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint;

    @ManyToOne(type => Acu, acu => acu.auto_task_schedules)
    @JoinColumn({ name: 'acu' })
    acus: Acu;

    public static resource: boolean = true
    public static async addItem (data: AutoTaskSchedule) {
        const autoTaskSchedule = new AutoTaskSchedule()

        autoTaskSchedule.name = data.name
        if ('description' in data) autoTaskSchedule.description = data.description
        autoTaskSchedule.access_point = data.access_point
        autoTaskSchedule.acu = data.acu
        if ('reaction_type' in data) autoTaskSchedule.reaction_type = data.reaction_type
        autoTaskSchedule.reaction = data.reaction
        if ('conditions' in data) autoTaskSchedule.conditions = JSON.stringify(data.conditions)
        autoTaskSchedule.condition = data.condition
        if ('enable' in data) autoTaskSchedule.enable = data.enable
        if ('one_time' in data) autoTaskSchedule.one_time = data.one_time
        autoTaskSchedule.company = data.company
        if ('reaction_access_points' in data) autoTaskSchedule.reaction_access_points = (data.reaction_access_points && typeof data.reaction_access_points === 'object') ? JSON.stringify(data.reaction_access_points) : data.reaction_access_points

        return new Promise((resolve, reject) => {
            this.save(autoTaskSchedule, { transaction: false })
                .then((item: AutoTaskSchedule) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AutoTaskSchedule) {
        const autoTaskSchedule = await this.findOneOrFail({ id: data.id })

        if ('name' in data) autoTaskSchedule.name = data.name
        if ('description' in data) autoTaskSchedule.description = data.description
        if ('access_point' in data) autoTaskSchedule.access_point = data.access_point
        if ('acu' in data) autoTaskSchedule.acu = data.acu
        if ('reaction_type' in data) autoTaskSchedule.reaction_type = data.reaction_type
        if ('reaction' in data) autoTaskSchedule.reaction = data.reaction
        if ('conditions' in data) autoTaskSchedule.conditions = JSON.stringify(data.conditions)
        if ('condition' in data) autoTaskSchedule.condition = data.condition
        if ('enable' in data) autoTaskSchedule.enable = data.enable
        if ('enable' in data) autoTaskSchedule.enable = data.enable
        if ('reaction_access_points' in data) {
            autoTaskSchedule.reaction_access_points = (data.reaction_access_points && typeof data.reaction_access_points === 'object') ? JSON.stringify(data.reaction_access_points) : data.reaction_access_points
        }

        if (!autoTaskSchedule) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(autoTaskSchedule, { transaction: false })
                .then((item: AutoTaskSchedule) => {
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
                .then((item: AutoTaskSchedule) => {
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
            const where: any = { id: data.id }
            if (data.company) where.company = data.company
            this.findOneOrFail(where).then((data: any) => {
                this.remove(data)
                    .then(() => {
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
