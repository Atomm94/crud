import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('ticket_message')
export class TicketMessage extends MainEntity {
    @Column('int', { name: 'ticket_id' })
    ticket_id: number

    @Column('int', { name: 'user_id' })
    user_id: number

    @Column('int', { name: 'message_id' })
    message_id: number

    public static async addItem (data: TicketMessage) {
        const ticketMessage = new TicketMessage()

        ticketMessage.ticket_id = data.ticket_id
        ticketMessage.user_id = data.user_id
        ticketMessage.message_id = data.message_id

        return new Promise((resolve, reject) => {
            this.save(ticketMessage)
                .then((item: TicketMessage) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: TicketMessage) {
        const ticketMessage = await this.findOneOrFail(data.id)

        if ('ticket_id' in data) ticketMessage.ticket_id = data.ticket_id
        if ('user_id' in data) ticketMessage.user_id = data.user_id
        if ('message_id' in data) ticketMessage.message_id = data.message_id

        if (!ticketMessage) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(ticketMessage)
                .then((item: TicketMessage) => {
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
                .then((item: TicketMessage) => {
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
