import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm'
import * as _ from 'lodash'

import { MainEntityColumns } from './MainEntityColumns'
import { fileSave } from '../../functions/file'
import fs from 'fs'
import { join } from 'path'
import { logger } from '../../../../modules/winston/logger'
import {
    Department,
    TicketMessage
} from './index'
import { Admin } from './Admin'

const parentDir = join(__dirname, '../../..')

@Entity('ticket')
export class Ticket extends MainEntityColumns {
    @Column('int', { name: 'department' })
    department: number

    @Column('varchar', { name: 'subject' })
    subject: string | null

    @Column('varchar', { name: 'message', nullable: true })
    message: string | null

    @Column('longtext', { name: 'image', nullable: true })
    image: string | null

    @Column('int', { name: 'user_id' })
    user_id: number

    @Column('timestamp', { name: 'last_update', nullable: true })
    last_update: string | null

    @Column('boolean', { name: 'active', default: true })
    active: boolean

    @Column('boolean', { name: 'read', default: false })
    read: boolean

    @ManyToOne(type => Admin, admin => admin.tickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Admin | null;

    @ManyToOne(type => Department, department => department.tickets)
    @JoinColumn({ name: 'department' })
    departments: Department | null;

    @OneToMany(type => TicketMessage, ticket_message => ticket_message.tickets, { nullable: true })
    ticket_messages: Array<TicketMessage>;

    public static async addItem (data: Ticket) {
        const ticket = new Ticket()
        const check = await Department.findOne({ where: { id: data.department } })
        ticket.department = data.department
        ticket.subject = data.subject
        ticket.message = data.message
        if ('image' in data) ticket.image = data.image
        ticket.user_id = data.user_id

        return new Promise((resolve, reject) => {
            if (check) {
                if (check.status) {
                    this.save(ticket, { transaction: false })
                        .then((item: Ticket) => {
                            resolve(item)
                        })
                        .catch((error: any) => {
                            reject(error)
                        })
                } else {
                    reject(new Error(`The ${data.department} department status is false!!`))
                }
            } else {
                reject(new Error(`The ${data.department} department not found!!`))
            }
        })
    }

    public static async updateItem (data: Ticket): Promise<{ [key: string]: any }> {
        const ticket = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, ticket)

        if ('department' in data) ticket.department = data.department
        if ('subject' in data) ticket.subject = data.subject
        if ('message' in data) ticket.message = data.message
        if ('image' in data) ticket.image = data.image
        if ('read' in data) ticket.read = data.read
        if ('active' in data) ticket.active = data.active

        if (!ticket) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(ticket, { transaction: false })
                .then((item: Ticket) => {
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

    public static async getItem (id: number, user: Admin, relations?: Array<string>) {
        const itemId: number = id
        const where: any = {
            id: itemId
        }
        if (user.super !== true) {
            if (user.department) {
                where.department = user.department
            } else {
                where.user_id = user.id
            }
        }
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                relations: relations || [],
                where: where
            })
                .then(async (item: Ticket) => {
                    if (item.user) {
                        const user_params: any = _.omit(item.user, ['password', 'super', 'verify_token'])
                        item.user = user_params
                    }
                    if (item.ticket_messages) {
                        item.ticket_messages.forEach((ticket_message: TicketMessage) => {
                            if (ticket_message.users) {
                                const user_params: any = _.omit(ticket_message.users, ['password', 'super', 'verify_token'])
                                ticket_message.users = user_params
                            }
                        })
                        if (item.ticket_messages.length && item.ticket_messages.slice(-1)[0].users.id !== user.id) {
                            const ticket_data: any = { id: id, read: true }
                            const updated = await this.updateItem(ticket_data)
                            if (updated.new) {
                                item.read = updated.new.read
                            }
                        }
                    }
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

    public static async getAllItems (params: any, user: Admin) {
        let where = {}
        if (user.super !== true) {
            if (user.department) {
                where = {
                    department: {
                        '=': user.department
                    }
                }
            } else {
                where = {
                    user_id: {
                        '=': user.id
                    }
                }
            }
        }

        if (user.super !== true) {
        }
        return new Promise((resolve, reject) => {
            this.findByParams({
                params,
                relations: params.relations || [],
                where: where
            })
                .then((items: Array<Ticket>) => {
                    items.forEach((item: Ticket, i: number) => {
                        if (item.user) {
                            const user_params: any = _.omit(item.user, ['password', 'super', 'verify_token'])
                            item.user = user_params
                        }
                        if (item.ticket_messages) {
                            item.ticket_messages.forEach((ticket_message: TicketMessage) => {
                                if (ticket_message.users) {
                                    const user_params: any = _.omit(ticket_message.users, ['password', 'super', 'verify_token'])
                                    ticket_message.users = user_params
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
        const check = await Ticket.findOne({ where: { id: data.ticket_id, active: true } })
        if (check) {
            return TicketMessage.addItem(data)
        } else {
            return `Ticket ${data.ticket_id} is not active !!!`
        }
    }

    public static async updateMessage (data: TicketMessage, user: Admin) {
        return TicketMessage.updateItem(data, user)
    }

    public static async getMessage (id: number) {
        return TicketMessage.getItem(id)
    }

    public static async destroyMessage (data: any) {
        return TicketMessage.destroyItem(data)
    }

    public static async getAllMessages (query: any) {
        return TicketMessage.getAllItems(query)
    }

    public static async saveMessageImage (file: any) {
        return TicketMessage.saveImage(file)
    }

    public static async deleteMessageImage (file: any) {
        return TicketMessage.deleteImage(file)
    }
}
