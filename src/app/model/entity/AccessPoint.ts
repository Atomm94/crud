import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    DeleteDateColumn,
    Index
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRule } from './AccessRule'
import { AccessPointGroup } from './AccessPointGroup'
import { AccessPointZone } from './AccessPointZone'
import { Acu } from './Acu'
import { Reader } from './Reader'
import { accessPointMode } from '../../enums/accessPointMode.enum'
import { accessPointType } from '../../enums/accessPointType.enum'
import { accessPointDoorState } from '../../enums/accessPointDoorState.enum'
import { AutoTaskSchedule } from './AutoTaskSchedule'
import { Notification } from './Notification'
import { minusResource } from '../../functions/minusResource'
import { socketChannels } from '../../enums/socketChannels.enum'
import SendSocketMessage from '../../mqtt/SendSocketMessage'
import { acuStatus } from '../../enums/acuStatus.enum'
import { AccessPointStatus } from './AccessPointStatus'
import { resourceKeys } from '../../enums/resourceKeys.enum'
import { CameraSet } from './CameraSet'

@Entity('access_point')
@Index(['id', 'company'])
export class AccessPoint extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('enum', { name: 'type', nullable: false, enum: accessPointType })
    type: accessPointType

    @Column('boolean', { name: 'status', default: false })
    status: boolean

    @Column('boolean', { name: 'actual_passage', default: false })
    actual_passage: boolean

    @Column('enum', { name: 'mode', nullable: false, enum: accessPointMode, default: accessPointMode.NOT_AVAILABLE })
    mode: accessPointMode

    @Column('enum', { name: 'exit_mode', nullable: false, enum: accessPointMode, default: accessPointMode.NOT_AVAILABLE })
    exit_mode: accessPointMode

    @Column('boolean', { name: 'apb_enable_local', default: false })
    apb_enable_local: boolean

    @Column('boolean', { name: 'apb_enable_timer', default: false })
    apb_enable_timer: boolean

    @Column('int', { name: 'access_point_group', nullable: true })
    access_point_group: number | null

    @Column('int', { name: 'access_point_zone', nullable: true })
    access_point_zone: number | null

    @Column('enum', { name: 'door_state', enum: accessPointDoorState, default: accessPointDoorState.NO_SENSOR })
    door_state: accessPointDoorState

    @Column('int', { name: 'acu', nullable: false })
    acu: number

    @Column('longtext', { name: 'resources', nullable: true })
    resources: string | null

    @Column('longtext', { name: 'last_activity', nullable: true })
    last_activity: string | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.access_points)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @OneToMany(type => AccessRule, access_rule => access_rule.access_points)
    access_rules: AccessRule[];

    @ManyToOne(type => AccessPointGroup, access_point_group => access_point_group.access_points, { nullable: true })
    @JoinColumn({ name: 'access_point_group' })
    access_point_groups: AccessPointGroup | null;

    @ManyToOne(type => AccessPointZone, access_point_zone => access_point_zone.access_points, { nullable: true })
    @JoinColumn({ name: 'access_point_zone' })
    access_point_zones: AccessPointZone | null;

    @ManyToOne(type => Acu, acu => acu.access_points)
    @JoinColumn({ name: 'acu' })
    acus: Acu;

    @OneToMany(type => AutoTaskSchedule, auto_task_schedule => auto_task_schedule.access_points)
    auto_task_schedules: AutoTaskSchedule[];

    @OneToMany(type => Reader, reader => reader.access_points)
    readers: Reader[];

    @OneToMany(type => Notification, notification => notification.access_points)
    notifications: Notification[];

    @OneToMany(type => AccessPointStatus, access_point_status => access_point_status.access_points)
    access_point_statuses: AccessPointStatus[];

    @OneToMany(() => CameraSet, cameraSet => cameraSet.access_points)
    camera_sets: CameraSet[]

    public static resource: boolean = true
    public static fields_that_used_in_sending: Array<string> = ['resources']
    public static required_fields_for_sending: Array<string> = ['type']

    public static async addItem (data: AccessPoint): Promise<AccessPoint> {
        const accessPoint = new AccessPoint()

        accessPoint.name = data.name
        if ('description' in data) accessPoint.description = data.description
        accessPoint.type = data.type
        if ('status' in data) accessPoint.status = data.status
        if ('actual_passage' in data) accessPoint.actual_passage = data.actual_passage
        if ('mode' in data) accessPoint.mode = data.mode
        if ('exit_mode' in data) accessPoint.exit_mode = data.exit_mode
        if ('apb_enable_local' in data) accessPoint.apb_enable_local = data.apb_enable_local
        if ('apb_enable_timer' in data) accessPoint.apb_enable_timer = data.apb_enable_timer
        if ('access_point_group' in data) accessPoint.access_point_group = data.access_point_group
        if ('access_point_zone' in data) accessPoint.access_point_zone = data.access_point_zone
        accessPoint.acu = data.acu
        if ('resources' in data) accessPoint.resources = (data.resources && typeof data.resources === 'object') ? JSON.stringify(data.resources) : data.resources
        accessPoint.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessPoint)
                .then((item: AccessPoint) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessPoint): Promise<{ [key: string]: any }> {
        const accessPoint = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, accessPoint)

        if ('name' in data) accessPoint.name = data.name
        if ('description' in data) accessPoint.description = data.description
        if ('type' in data) accessPoint.type = data.type
        if ('status' in data) accessPoint.status = data.status
        if ('actual_passage' in data) accessPoint.actual_passage = data.actual_passage
        if ('mode' in data) accessPoint.mode = data.mode
        if ('apb_enable_local' in data) accessPoint.apb_enable_local = data.apb_enable_local
        if ('apb_enable_timer' in data) accessPoint.apb_enable_timer = data.apb_enable_timer
        if ('access_point_group' in data) accessPoint.access_point_group = data.access_point_group
        if ('access_point_zone' in data) accessPoint.access_point_zone = data.access_point_zone
        if ('door_state' in data) accessPoint.door_state = data.door_state
        if ('acu' in data) accessPoint.acu = data.acu
        if ('resources' in data) {
            let resources = (data.resources && typeof data.resources === 'object') ? JSON.stringify(data.resources) : data.resources
            if (resources) {
                const resourcesObj = JSON.parse(resources)
                for (const resource in resourcesObj) {
                    if (resourcesObj[resource] === -1) delete resourcesObj[resource]
                }
                resources = JSON.stringify(resourcesObj)
            }
            accessPoint.resources = resources
        }
        if ('last_activity' in data) accessPoint.last_activity = (data.last_activity && typeof data.last_activity === 'object') ? JSON.stringify(data.last_activity) : data.last_activity

        if (!accessPoint) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessPoint)
                .then((item: AccessPoint) => {
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

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: AccessPoint) => {
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
                this.softRemove(data)
                    .then(async () => {
                        let resource_name = this.name
                        if (data.type === accessPointType.FLOOR) {
                            resource_name = resourceKeys.ELEVATOR
                        } else if ([accessPointType.TURNSTILE_ONE_SIDE, accessPointType.TURNSTILE_TWO_SIDE].includes(data.type)) {
                            resource_name = resourceKeys.TURNSTILE
                        }
                        minusResource(resource_name, data.company)

                        const modes: any = await this.createQueryBuilder('access_point')
                            .select('access_point.name')
                            .addSelect('access_point.mode')
                            .addSelect('COUNT(access_point.id) as acp_qty')
                            .where('access_point.company', data.company)
                            .groupBy('access_point.mode')
                            .getRawMany()
                        new SendSocketMessage(socketChannels.DASHBOARD_ACCESS_POINT_MODES, modes, data.company)

                        const acu: any = await Acu.findOne({ where: { id: data.acu, status: acuStatus.ACTIVE } })
                        if (acu) {
                            const cloud_status_data = {
                                id: data.id,
                                acus: {
                                    id: acu.id,
                                    cloud_status: acu.cloud_status
                                },
                                delete: true
                            }
                            new SendSocketMessage(socketChannels.DASHBOARD_CLOUD_STATUS, cloud_status_data, data.company)
                        }

                        const readers: any = await Reader.getAllItems({ where: { access_point: { '=': data.id } } })
                        for (const reader of readers) {
                            if (!reader.delete_date) Reader.destroyItem({ id: reader.id, company: reader.company })
                        }

                        const access_rules: any = await AccessRule.getAllItems({ where: { access_point: { '=': data.id } } })
                        for (const access_rule of access_rules) {
                            if (!access_rule.delete_date) AccessRule.destroyItem({ id: access_rule.id, company: access_rule.company })
                        }

                        AccessPointStatus.destroyItem({ access_point: data.id })

                        const camera_sets: any = await CameraSet.getAllItems({ where: { access_point: { '=': data.id } } })
                        for (const camera_set of camera_sets) {
                            CameraSet.destroyItem({ id: camera_set.id, company: camera_set.company })
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
