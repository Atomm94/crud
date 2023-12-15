import {
    Entity,
    Column,
    JoinColumn,
    OneToOne
} from 'typeorm'
import { Company } from '.'

import { MainEntity } from './MainEntity'

@Entity('company_resources')
export class CompanyResources extends MainEntity {
    @Column('int', { name: 'company', nullable: false, unique: true })
    company: number

    @Column('longtext', { name: 'used', nullable: false })
    used: string

    @OneToOne(type => Company, company => company.company_resources, { nullable: true })
    @JoinColumn({ name: 'company' })
    companies: Company | null;

    static gettingActions = false

    public static async addItem (data: CompanyResources) {
        const companyResources = new CompanyResources()

        companyResources.company = data.company
        companyResources.used = data.used

        return new Promise((resolve, reject) => {
            this.save(companyResources, { transaction: false })
                .then((item: CompanyResources) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CompanyResources): Promise<{ [key: string]: any }> {
        const companyResources = await this.findOneOrFail({ where: { id: data.id } })

        if ('company' in data) companyResources.company = data.company
        if ('used' in data) companyResources.used = data.used

        if (!companyResources) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(companyResources, { transaction: false })
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
            this.findOneOrFail({ where: { id: itemId } })
                .then((item: CompanyResources) => {
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
            this.findOneOrFail({ where: { id: data.id, company: data.company } }).then((data: any) => {
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
