import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    AfterInsert
} from 'typeorm'

import { MainEntity } from './MainEntity'
import {
    Ticket,
    Admin
} from './index'

@Entity('ticket_message')
export class TicketMessage extends MainEntity {
    @Column('int', { name: 'ticket_id' })
    ticket_id: number

    @Column('int', { name: 'user_id' })
    user_id: number

    @Column('varchar', { name: 'text' })
    text: string

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @ManyToOne(type => Ticket, ticket => ticket.ticket_messages)
    @JoinColumn({ name: 'ticket_id' })
    tickets: Ticket;

    @ManyToOne(type => Admin, admin => admin.ticket_messages)
    @JoinColumn({ name: 'user_id' })
    users: Ticket;

    @AfterInsert()
    async updateTicketReadStatus () {
        const ticket = await Ticket.findOneOrFail({
            where: { id: this.ticket_id }
        })
        ticket.read = false
        ticket.save()
    }

    public static gettingActions: boolean = false
    // public static gettingAttributes: boolean = true

    public static async addItem (data: TicketMessage) {
        const ticketMessage = new TicketMessage()

        ticketMessage.ticket_id = data.ticket_id
        ticketMessage.user_id = data.user_id
        ticketMessage.text = data.text
        if ('parent_id' in data) ticketMessage.parent_id = data.parent_id

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

    public static async updateItem (data: TicketMessage, user: Admin) {
        const ticketMessage = await this.findOneOrFail(data.id)

        if ('text' in data) ticketMessage.text = data.text
        // if ('parent_id' in data) ticketMessage.parent_id = data.parent_id

        if (!ticketMessage) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            if (ticketMessage.user_id === user.id) {
                this.save(ticketMessage)
                    .then((item: TicketMessage) => {
                        resolve(item)
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            } else {
                reject(new Error(`User ${user.id} cant update ${ticketMessage.user_id} user message!!!`))
            }
        })
    }

    public static async getItem (id: number) {
        const itemId: number = id
        const relations = ['tickets', 'users']
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: { id: itemId },
                relations: relations || []
            })
                .then((item: TicketMessage) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: { id: number }, user: Admin) {
        const itemId: number = +data.id
        const ticketMessage = await this.findOneOrFail(itemId)
        if (!ticketMessage) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            if (ticketMessage.user_id === user.id) {
                this.delete(itemId)
                    .then(() => {
                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            } else {
                reject(new Error(`User ${user.id} cant update ${ticketMessage.user_id} user message!!!`))
            }
        })
    }

    public static async getAllItems (params?: any) {
        params.relations = ['tickets', 'users']
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
