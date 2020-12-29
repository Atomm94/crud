import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('social')
export class Social extends MainEntity {
    @Column('varchar', { name: 'title', nullable: true, length: '255', unique: true })
    title: string | null

    @Column('varchar', { name: 'url', nullable: true, length: '255' })
    url: string | null

    @Column('varchar', { name: 'class', nullable: true, length: '255' })
    class: string | null

    @Column('varchar', { name: 'icon_class', nullable: true, length: '255' })
    icon_class: string | null

    static gettingActions = false

    public static async addItem (data: Social) {
        const social = new Social()

        social.title = data.title
        social.url = data.url
        social.class = data.class
        social.icon_class = data.icon_class

        return new Promise((resolve, reject) => {
            this.save(social)
                .then((item: Social) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Social): Promise<{ [key: string]: any }> {
        const social = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, social)

        if ('title' in data) social.title = data.title
        if ('url' in data) social.url = data.url
        if ('class' in data) social.class = data.class
        if ('icon_class' in data) social.icon_class = data.icon_class

        if (!social) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(social)
                .then((item: Social) => {
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
                .then((item: Social) => {
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
}
