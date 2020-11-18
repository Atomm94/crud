import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('company_resources')
export class CompanyResources extends MainEntity {
    @Column('varchar', { name: 'company', nullable: false })
    company: string

    @Column('longtext', { name: 'limit', nullable: false })
    limit: string

    @Column('longtext', { name: 'used', nullable: false })
    used: string

    public static async addItem (data: CompanyResources) {
        const companyResources = new CompanyResources()

        companyResources.company = data.company
        companyResources.limit = data.limit
        companyResources.used = data.used

        return new Promise((resolve, reject) => {
            this.save(companyResources)
                .then((item: CompanyResources) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CompanyResources) {
        const companyResources = await this.findOneOrFail(data.id)

        if ('company' in data) companyResources.company = data.company
        if ('limit' in data) companyResources.limit = data.limit
        if ('used' in data) companyResources.used = data.used

        if (!companyResources) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(companyResources)
                .then((item: CompanyResources) => {
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
                .then((item: CompanyResources) => {
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
