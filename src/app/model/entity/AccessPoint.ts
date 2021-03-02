import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'

import { accessPointMode } from '../../enums/accessPointMode.enum'
import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRule } from './AccessRule'
import { AccessPointGroup } from './AccessPointGroup'
import { AccessPointZone } from './AccessPointZone'
import { Acu } from './Acu'
import { Reader } from './Reader'

@Entity('access_point')
export class AccessPoint extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('longtext', { name: 'type', nullable: false })
    type: string | null

    @Column('boolean', { name: 'status', default: false })
    status: boolean

    @Column('boolean', { name: 'actual_passage', default: false })
    actual_passage: boolean

    @Column('enum', { name: 'mode', nullable: false, enum: accessPointMode, default: accessPointMode.NOT_AVAILABLE })
    mode: accessPointMode

    @Column('boolean', { name: 'apb_enable_local', default: false })
    apb_enable_local: boolean

    @Column('boolean', { name: 'apb_enable_timer', default: false })
    apb_enable_timer: boolean

    @Column('int', { name: 'access_point_group', nullable: true })
    access_point_group: number | null

    @Column('int', { name: 'access_point_zone', nullable: true })
    access_point_zone: number | null

    @Column('int', { name: 'acu', nullable: false })
    acu: number | null

    @Column('longtext', { name: 'resources', nullable: true })
    resources: string | null

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
    access_point_zones: AccessPointGroup | null;

    @ManyToOne(type => Acu, acu => acu.access_points)
    @JoinColumn({ name: 'acu' })
    acus: Acu;

    @OneToMany(type => Reader, reader => reader.accessPoints)
    readers: Reader[];

    public static async addItem (data: AccessPoint) {
        const accessPoint = new AccessPoint()

        accessPoint.name = data.name
        if ('description' in data) accessPoint.description = data.description
        accessPoint.type = data.type
        if ('status' in data) accessPoint.status = data.status
        if ('actual_passage' in data) accessPoint.actual_passage = data.actual_passage
        if ('mode' in data) accessPoint.mode = data.mode
        if ('apb_enable_local' in data) accessPoint.apb_enable_local = data.apb_enable_local
        if ('apb_enable_timer' in data) accessPoint.apb_enable_timer = data.apb_enable_timer
        if ('access_point_group' in data) accessPoint.access_point_group = data.access_point_group
        if ('access_point_zone' in data) accessPoint.access_point_zone = data.access_point_zone
        accessPoint.acu = data.acu
        if ('resources' in data) accessPoint.resources = data.resources
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
        const accessPoint = await this.findOneOrFail(data.id)
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
        if ('acu' in data) accessPoint.acu = data.acu
        if ('resources' in data) accessPoint.resources = data.resources

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
