import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRule } from './AccessRule'
import { AccessPointGroup } from './AccessPointGroup'
import { AccessPointZone } from './AccessPointZone'

@Entity('access_point')
export class AccessPoint extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('int', { name: 'access_point_group', nullable: true })
    access_point_group: number

    @Column('int', { name: 'access_point_zone', nullable: true })
    access_point_zone: number

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

    public static async addItem (data: AccessPoint) {
        const access_point: AccessPoint = new AccessPoint()

        access_point.name = data.name
        access_point.company = data.company

        return new Promise((resolve, reject) => {
            this.save(access_point)
                .then((item: AccessPoint) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessPoint): Promise<{ [key: string]: any }> {
        const access_point = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, access_point)

        if ('name' in data) access_point.name = data.name

        if (!access_point) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(access_point)
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

    public static async getItem (where: any) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where
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
