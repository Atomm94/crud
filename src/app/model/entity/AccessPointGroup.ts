import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'

import { AccessPoint } from './AccessPoint'

@Entity('access_point_group')
export class AccessPointGroup extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @OneToMany(type => AccessPoint, accessPoint => accessPoint.accessPointGroups)
    accessPoints: AccessPoint[];

    public static async addItem (data: AccessPointGroup) {
        const accessPointGroup = new AccessPointGroup()

        accessPointGroup.name = data.name
        accessPointGroup.description = data.description
        accessPointGroup.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessPointGroup)
                .then((item: AccessPointGroup) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessPointGroup): Promise<{ [key: string]: any }> {
        const accessPointGroup = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, accessPointGroup)

        if ('name' in data) accessPointGroup.name = data.name
        if ('description' in data) accessPointGroup.description = data.description
        if ('company' in data) accessPointGroup.company = data.company

        if (!accessPointGroup) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessPointGroup)
                .then((item: AccessPointGroup) => {
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
                .then((item: AccessPointGroup) => {
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
