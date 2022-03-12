import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    DeleteDateColumn
} from 'typeorm'
import { minusResource } from '../../functions/minusResource'

import {
    MainEntity,
    Company,
    CardholderGroup,
    AccessRule,
    Cardholder
} from './index'

@Entity('access_right')
export class AccessRight extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public delete_date: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.access_rights)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @OneToMany(type => AccessRule, access_rule => access_rule.access_rights)
    access_rules: AccessRule[];

    @OneToMany(type => CardholderGroup, cardholder_group => cardholder_group.access_rights)
    cardholder_groups: CardholderGroup[];

    @OneToMany(type => Cardholder, cardholder => cardholder.access_rights)
    cardholders: Cardholder[];

    @OneToMany(type => Company, company => company.base_access_rights)
    base_companies: Company[];

    public static resource: boolean = true

    public static async addItem (data: AccessRight) {
        const accessRight = new AccessRight()

        accessRight.name = data.name
        if ('description' in data) accessRight.description = data.description
        accessRight.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessRight)
                .then((item: AccessRight) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessRight): Promise<{ [key: string]: any }> {
        const accessRight = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, accessRight)
        if ('name' in data) accessRight.name = data.name
        if ('description' in data) accessRight.description = data.description

        if (!accessRight) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessRight)
                .then((item: AccessRight) => {
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
                .then((item: AccessRight) => {
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
            this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        minusResource(this.name, data.company)
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
