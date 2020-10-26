import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('message')
export class Message extends MainEntity {
    @Column('varchar', { name: 'text' })
    text: string

    @Column('int', { name: 'parent_id' })
    parent_id: number

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addMessage (data: Message) {
        const message = new Message()

        message.text = data.text
        message.parent_id = data.parent_id

        return new Promise((resolve, reject) => {
            this.save(message)
                .then((item: Message) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateMessage (data: Message) {
        const message = await this.findOneOrFail(data.id)

        if ('text' in data) message.text = data.text
        if ('parent_id' in data) message.parent_id = data.parent_id

        if (!message) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(message)
                .then((item: Message) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getMessage (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail(itemId)
                .then((item: Message) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyMessage (data: { id: number }) {
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

    public static async getAllMessages (params?: any) {
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
