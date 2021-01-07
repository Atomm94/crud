import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { fileSave } from '../../functions/file'
import fs from 'fs'
import { join } from 'path'
import { logger } from '../../../../modules/winston/logger'
const parentDir = join(__dirname, '../../..')

@Entity('company_documents')
export class CompanyDocuments extends MainEntity {
    @Column('varchar', { name: 'name' })
    name: string

    @Column('varchar', { name: 'date', nullable: true })
    date: string | null

    @Column('int', { name: 'company', nullable: true })
    company: number | null

    @Column('longtext', { name: 'file', nullable: true })
    file: string | null

    @ManyToOne(type => Company, company => company.company_documents)
    @JoinColumn({ name: 'company' })
    companies: Company;

    public static async addItem (data: CompanyDocuments) {
        const companyDocuments = new CompanyDocuments()

        companyDocuments.name = data.name
        companyDocuments.date = data.date
        companyDocuments.company = data.company
        companyDocuments.file = data.file

        return new Promise((resolve, reject) => {
            this.save(companyDocuments)
                .then((item: CompanyDocuments) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CompanyDocuments): Promise<{ [key: string]: any }> {
        const companyDocuments = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, companyDocuments)

        if ('name' in data) companyDocuments.name = data.name
        if ('date' in data) companyDocuments.date = data.date
        if ('company' in data) companyDocuments.company = data.company
        if ('file' in data) companyDocuments.file = data.file

        if (!companyDocuments) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(companyDocuments)
                .then((item: CompanyDocuments) => {
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
                .then((item: CompanyDocuments) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: { id: number }) {
        const itemId: number = +data.id
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.remove(await this.findByIds([itemId]))
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

    public static async saveFile (file: any) {
        return fileSave(file)
    }

    public static async deleteFile (file: any) {
        return fs.unlink(`${parentDir}/public/${file}`, (err) => {
            if (err) throw err
            logger.info('Delete complete!')
        })
    }
}
