import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './index'
import { autoTaskScheduleType } from '../../enums/autoTaskScheduleType.enum'
import { autoTaskStatus } from '../../enums/autoTaskStatus.enum'
import { AccessPoint } from './AccessPoint'
import { Schedule } from './Schedule'

@Entity('auto_task_schedule')
export class AutoTaskSchedule extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'access_point', nullable: false })
    access_point: number

    @Column('longtext', { name: 'command', nullable: false })
    command: string

    @Column('int', { name: 'schedule', nullable: true })
    schedule: number | null

    @Column('enum', { name: 'schedule_type', enum: autoTaskScheduleType })
    schedule_type: string

    @Column('longtext', { name: 'custom_schedule', nullable: true })
    custom_schedule: string | null

    @Column('enum', { name: 'condition', default: autoTaskStatus.PENDING, enum: autoTaskStatus })
    condition: string

    @Column('enum', { name: 'status', default: autoTaskStatus.PENDING, enum: autoTaskStatus })
    status: string

    @Column('boolean', { name: 'enable', default: true })
    enable: boolean

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => AccessPoint, access_point => access_point.auto_task_schedules)
    @JoinColumn({ name: 'access_point' })
    access_points: AccessPoint;

    @ManyToOne(type => Schedule, schedule => schedule.auto_task_schedules, { nullable: true })
    @JoinColumn({ name: 'schedule' })
    schedules: Schedule | null;

    public static async addItem (data: AutoTaskSchedule) {
        const autoTaskSchedule = new AutoTaskSchedule()

        autoTaskSchedule.name = data.name
        if ('description' in data) autoTaskSchedule.description = data.description
        autoTaskSchedule.access_point = data.access_point
        autoTaskSchedule.command = JSON.stringify(data.command)
        if ('schedule' in data) autoTaskSchedule.schedule = data.schedule
        autoTaskSchedule.schedule_type = data.schedule_type
        if ('custom_schedule' in data) autoTaskSchedule.custom_schedule = (data.custom_schedule) ? JSON.stringify(data.custom_schedule) : null
        autoTaskSchedule.condition = data.condition
        autoTaskSchedule.status = data.status
        if ('enable' in data) autoTaskSchedule.enable = data.enable
        autoTaskSchedule.company = data.company

        return new Promise((resolve, reject) => {
            this.save(autoTaskSchedule)
                .then((item: AutoTaskSchedule) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AutoTaskSchedule) {
        const autoTaskSchedule = await this.findOneOrFail(data.id)

        if ('name' in data) autoTaskSchedule.name = data.name
        if ('description' in data) autoTaskSchedule.description = data.description
        if ('access_point' in data) autoTaskSchedule.access_point = data.access_point
        if ('command' in data) autoTaskSchedule.command = JSON.stringify(data.command)
        if ('schedule' in data) autoTaskSchedule.schedule = data.schedule
        if ('schedule_type' in data) autoTaskSchedule.schedule_type = data.schedule_type
        if ('custom_schedule' in data) autoTaskSchedule.custom_schedule = (data.custom_schedule) ? JSON.stringify(data.custom_schedule) : null
        if ('condition' in data) autoTaskSchedule.condition = data.condition
        if ('status' in data) autoTaskSchedule.status = data.status
        if ('enable' in data) autoTaskSchedule.enable = data.enable

        if (!autoTaskSchedule) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(autoTaskSchedule)
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
