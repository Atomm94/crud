import {
    Entity,
    Column,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { PackageType } from './PackageType'
import { Company } from './Company'

@Index('name|deleteDate', ['name', 'deleteDate'], { unique: true })

@Entity('package')
export class Package extends MainEntity {
    @Column('varchar', { name: 'name' })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'package_type' })
    package_type: number

    @Column('boolean', { name: 'free', default: true })
    free: boolean

    @Column('float', { name: 'price', nullable: true })
    price: number | null

    @Column('longtext', { name: 'pay_terms', nullable: true })
    pay_terms: string | null

    @Column('longtext', { name: 'extra_settings', nullable: false })
    extra_settings: string

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    @Column('boolean', { name: 'default', default: false })
    default: boolean

    @Column('boolean', { name: 'create_package_zoho_sync', default: false })
    create_package_zoho_sync: boolean

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @ManyToOne(type => PackageType, packageType => packageType.packages)
    @JoinColumn({ name: 'package_type' })
    package_types: PackageType;

    @OneToMany(type => Company, company => company.package, { nullable: true })
    packages: Package[] | null;

    public static async addItem (data: Package) {
        const package_data = new Package()

        package_data.name = data.name
        package_data.description = data.description
        package_data.package_type = data.package_type
        package_data.free = data.free
        package_data.price = data.price
        package_data.pay_terms = data.pay_terms
        package_data.status = data.status
        package_data.extra_settings = data.extra_settings
        if ('default' in data) package_data.default = data.default

        return new Promise((resolve, reject) => {
            this.save(package_data)
                .then((item: Package) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Package): Promise<{ [key: string]: any }> {
        const package_data = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, package_data)

        if ('name' in data) package_data.name = data.name
        if ('description' in data) package_data.description = data.description
        if ('package_type' in data) package_data.package_type = data.package_type
        if ('free' in data) package_data.free = data.free
        if ('price' in data) package_data.price = data.price
        if ('pay_terms' in data) package_data.pay_terms = data.pay_terms
        if ('status' in data) package_data.status = data.status
        if ('extra_settings' in data) package_data.extra_settings = data.extra_settings
        if ('default' in data) package_data.default = data.default

        if (!package_data) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(package_data)
                .then((item: Package) => {
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

    public static async getItem (id: number, where: any, relations?: Array<string>) {
        const itemId: number = id
        where.id = itemId
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: Package) => {
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
