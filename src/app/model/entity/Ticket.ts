import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { fileSave } from '../../functions/file'
import fs from 'fs'
import { join } from 'path'
import { logger } from '../../../../modules/winston/logger'
import {
    Department,
    TicketMessage,
    Admin
} from './index'
import { pick } from 'lodash'

const parentDir = join(__dirname, '../../..')

@Entity('ticket')
export class Ticket extends MainEntity {
    @Column('int', { name: 'department' })
    department: number | null

    @Column('varchar', { name: 'subject' })
    subject: string | null

    @Column('varchar', { name: 'message', nullable: true })
    message: string | null

    @Column('json', { name: 'image', nullable: true })
    image: JSON | null

    @Column('timestamp', { name: 'last_update', nullable: true })
    last_update: string | null

    @Column('boolean', { name: 'active', default: true })
    active: boolean

    @Column('boolean', { name: 'read', default: false })
    read: boolean

    @ManyToOne(type => Department, department => department.tickets)
    @JoinColumn({ name: 'department' })
    departments: Department | null;

    @OneToMany(type => TicketMessage, ticket_message => ticket_message.tickets, { nullable: true })
    ticket_messages: TicketMessage[] | null;

    public static async addItem (data: Ticket) {
        const ticket = new Ticket()

        ticket.department = data.department
        ticket.subject = data.subject
        ticket.message = data.message
        ticket.image = data.image

        return new Promise((resolve, reject) => {
            this.save(ticket)
                .then((item: Ticket) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Ticket) {
        const ticket = await this.findOneOrFail(data.id)

        if ('department' in data) ticket.department = data.department
        if ('subject' in data) ticket.subject = data.subject
        if ('message' in data) ticket.message = data.message
        if ('image' in data) ticket.image = data.image

        if (!ticket) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(ticket)
                .then((item: Ticket) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (id: number, relations?: Array<string>) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: { id: itemId },
                relations: relations || []
            })
                .then((item: Ticket) => {
                    if (item.ticket_messages) {
                        item.ticket_messages.forEach((ticket_message: TicketMessage) => {
                            if (ticket_message.users) {
                                const user_params: any = pick(ticket_message, 'users.id', 'users.full_name', 'users.avatar')
                                ticket_message.users = user_params.users
                            }
                        })
                    }
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
                .then((items: Array<Ticket>) => {
                    items.forEach((item: Ticket, i: number) => {
                        if (item.ticket_messages) {
                            item.ticket_messages.forEach((ticket_message: TicketMessage) => {
                                if (ticket_message.users) {
                                    const user_params: any = pick(ticket_message, 'users.id', 'users.full_name', 'users.avatar')
                                    ticket_message.users = user_params.users
                                }
                            })
                        }
                    })
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async saveImage (file: any) {
        return fileSave(file)
    }

    public static async deleteImage (file: any) {
        return fs.unlink(`${parentDir}/public/${file}`, (err) => {
            if (err) throw err
            logger.info('Delete complete!')
        })
    }

    public static async addMessage (data: TicketMessage) {
        return TicketMessage.addItem(data)
    }

    public static async updateMessage (data: TicketMessage, user: Admin) {
        return TicketMessage.updateItem(data, user)
    }

    public static async getMessage (id: number) {
        return TicketMessage.getItem(id)
    }

    public static async destroyMessage (data: { id: number }, user: Admin) {
        return TicketMessage.destroyItem(data, user)
    }

    public static async getAllMessages (query: any) {
        return TicketMessage.getAllItems(query)
    }
}
