import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { CardholderGroup } from './CardholderGroup'
import { AccessRule } from './AccessRule'
import { Cardholder } from './Cardholder'

@Entity('access_right')
export class AccessRight extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

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

    public static async addItem (data: AccessRight) {
        const accessRight = new AccessRight()

        accessRight.name = data.name
        accessRight.description = data.description
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

    public static async updateItem (data: AccessRight) {
        const accessRight = await this.findOneOrFail(data.id)

        if ('name' in data) accessRight.name = data.name
        if ('description' in data) accessRight.description = data.description

        if (!accessRight) return { status: 400, messsage: 'Item not found' }
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
