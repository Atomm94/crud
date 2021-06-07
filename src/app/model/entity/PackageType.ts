import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Package } from './Package'
import { Company } from './Company'

@Entity('package_type')
export class PackageType extends MainEntity {
    @Column('varchar', { name: 'name', unique: true })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('boolean', { name: 'service', default: false })
    service: boolean

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    @OneToMany(type => Package, package_data => package_data.package_types)
    packages: Package[];

    @OneToMany(type => Company, company => company.package_type)
    companies: Company[];

    public static async addItem (data: PackageType) {
        const packageType = new PackageType()

        packageType.name = data.name
        packageType.status = data.status
        packageType.description = data.description
        if ('service' in data) packageType.service = data.service

        return new Promise((resolve, reject) => {
            this.save(packageType)
                .then((item: PackageType) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: PackageType): Promise<{ [key: string]: any }> {
        const packageType = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, packageType)

        if ('name' in data) packageType.name = data.name
        if ('status' in data) packageType.status = data.status
        if ('description' in data) packageType.description = data.description
        if ('service' in data) packageType.service = data.service

        if (!packageType) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(packageType)
                .then((item: PackageType) => {
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
            this.findOneOrFail(itemId)
                .then((item: PackageType) => {
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
            this.findOneOrFail({ id: data.id }).then((data: any) => {
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
