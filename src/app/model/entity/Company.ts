import {
    Entity,
    Column,
    OneToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Packet } from './Packet'

@Entity('company')
export class Company extends MainEntity {
    @Column('varchar', { name: 'company_name' })
    company_name: string

    @Column('int', { name: 'product', nullable: true })
    product: number | null

    @Column('varchar', { name: 'message', nullable: true })
    message: string | null

    @Column('varchar', { name: 'status', default: 'pending' })
    status: string

    @OneToOne(type => Packet, packet => packet.id, { nullable: true })
    companies: Company[] | null;

    public static async addItem (data: Company) {
        const company = new Company()

        company.company_name = data.company_name
        company.product = data.product
        company.message = data.message
        company.status = data.status

        return new Promise((resolve, reject) => {
            this.save(company)
                .then((item: Company) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Company) {
        const company = await this.findOneOrFail(data.id)

        if ('company_name' in data) company.company_name = data.company_name
        if ('product' in data) company.product = data.product
        if ('message' in data) company.message = data.message
        if ('status' in data) company.status = data.status

        if (!company) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(company)
                .then((item: Company) => {
                    resolve(item)
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
                .then((item: Company) => {
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
