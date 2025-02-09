import {
    Entity,
    Column
} from 'typeorm'

import { MainEntityColumns } from './MainEntityColumns'

@Entity('translations')
export class Translation extends MainEntityColumns {
    @Column('varchar', { name: 'term', nullable: true, length: '255', unique: true })
    term: string | null

    @Column('longtext', { name: 'translations', nullable: true })
    translations: { [key: string]: string[] } | null;

    public static async addItem (data: Translation) {
        const translations = new Translation()

        translations.term = data.term
        translations.translations = data.translations

        return new Promise((resolve, reject) => {
            this.save(translations, { transaction: false })
                .then((item: Translation) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Translation): Promise<{ [key: string]: any }> {
        const translations = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, translations)

        if ('term' in data) translations.term = data.term
        if ('translations' in data) translations.translations = data.translations

        if (!translations) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(translations, { transaction: false })
                .then((item: Translation) => {
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
            this.findOneOrFail({ where: { id: itemId } })
                .then((item: Translation) => {
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
            this.findOneOrFail({ where: { id: data.id } }).then((data: any) => {
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
