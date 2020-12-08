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

@Entity('entry')
export class Entry extends MainEntity {
    @Column('varchar', { name: 'name' })
    name: string

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.entries)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @OneToMany(type => AccessRight, access_right => access_right.entries)
    access_rights: AccessRight[];

    public static async addItem (data: Entry) {
        const entry = new Entry()

        entry.name = data.name
        entry.company = data.company

        return new Promise((resolve, reject) => {
            this.save(entry)
                .then((item: Entry) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Entry) {
        const entry = await this.findOneOrFail(data.id)

        if ('name' in data) entry.name = data.name

        if (!entry) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(entry)
                .then((item: Entry) => {
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
                .then((item: Entry) => {
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
