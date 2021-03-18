import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('language')
export class Language extends MainEntity {
    @Column('varchar', { name: 'title', nullable: true, length: '255', unique: true })
    title: string | null

    @Column('varchar', { name: 'iso', nullable: true })
    iso: string | null

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    static gettingActions = false

    public static async addItem (data: Language) {
        const language = new Language()

        language.title = data.title
        language.iso = data.iso
        language.status = data.status

        return new Promise((resolve, reject) => {
            this.save(language)
                .then((item: Language) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Language): Promise<{ [key: string]: any }> {
        const language = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, language)

        if ('title' in data) language.title = data.title
        if ('iso' in data) language.iso = data.iso
        if ('status' in data) language.status = data.status

        if (!language) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(language)
                .then((item: Language) => {
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
                .then((item: Language) => {
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
