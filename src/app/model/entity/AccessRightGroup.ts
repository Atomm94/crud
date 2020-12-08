import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRight } from './AccessRight'
import { User } from '.'

@Entity('access_right_group')
export class AccessRightGroup extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.access_right_groups)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @OneToMany(type => AccessRight, access_right => access_right.access_groups)
    access_rights: AccessRight[];

    @OneToMany(type => User, user => user.access_right_groups)
    user: User[];

    public static async addItem (data: AccessRightGroup) {
        const accessRightGroup = new AccessRightGroup()

        accessRightGroup.name = data.name
        accessRightGroup.description = data.description
        accessRightGroup.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessRightGroup)
                .then((item: AccessRightGroup) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessRightGroup) {
        const accessRightGroup = await this.findOneOrFail(data.id)

        if ('name' in data) accessRightGroup.name = data.name
        if ('description' in data) accessRightGroup.description = data.description

        if (!accessRightGroup) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessRightGroup)
                .then((item: AccessRightGroup) => {
                    resolve(item)
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
                .then((item: AccessRightGroup) => {
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
