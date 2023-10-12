import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    AfterInsert
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { fileSave } from '../../functions/file'
import {
    Ticket
} from './index'
import { Admin } from './Admin'
import { logger } from '../../../../modules/winston/logger'
import fs from 'fs'
import { join } from 'path'

const parentDir = join(__dirname, '../../..')

@Entity('ticket_message')
export class TicketMessage extends MainEntity {
    @Column('int', { name: 'ticket_id' })
    ticket_id: number

    @Column('int', { name: 'user_id' })
    user_id: number

    @Column('varchar', { name: 'text' })
    text: string

    @Column('longtext', { name: 'image', nullable: true })
    image: string | null

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @ManyToOne(type => Ticket, ticket => ticket.ticket_messages, { onDelete: 'CASCADE' })
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
        if ('image' in data) ticketMessage.image = data.image
        return new Promise((resolve, reject) => {
            this.save(ticketMessage, { transaction: false })
                .then((item: TicketMessage) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: TicketMessage, user: Admin): Promise<{old:TicketMessage, new:TicketMessage}|{[key: string]:any}> {
        const ticketMessage = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, ticketMessage)

        if ('text' in data) ticketMessage.text = data.text
        if ('image' in data) ticketMessage.image = data.image
        // if ('parent_id' in data) ticketMessage.parent_id = data.parent_id

        if (!ticketMessage) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            if (ticketMessage.user_id === user.id) {
                this.save(ticketMessage, { transaction: false })
                    .then((item: TicketMessage) => {
                        resolve({
                            old: oldData,
                            new: item
                        })
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

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor

        const ticketMessage = await this.findOneOrFail({ id: data.id })
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail({ id: data.id }).then((data: any) => {
            if (ticketMessage.user_id === data.user) {
                this.remove(data)
                    .then(() => {
                        resolve({ message: 'success' })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
                } else {
                    reject(new Error(`User ${data.user} cant update ${ticketMessage.user_id} user message!!!`))
            }
            }).catch((error: any) => {
                reject(error)
            })
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

    public static async saveImage (file: any) {
        return fileSave(file)
    }

    public static async deleteImage (file: any) {
        return fs.unlink(`${parentDir}/public/${file}`, (err) => {
            if (err) throw err
            logger.info('Delete complete!')
        })
    }
}
