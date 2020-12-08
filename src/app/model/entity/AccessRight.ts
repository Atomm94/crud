import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { AccessRightGroup } from './AccessRightGroup'
import { Entry } from './Entry'
import { Schedule } from './Schedule'
import { Limitation } from '.'

@Entity('access_right')
export class AccessRight extends MainEntity {
    @Column('int', { name: 'access_group', nullable: false })
    access_group: number

    @Column('int', { name: 'entry', nullable: false })
    entry: number

    @Column('int', { name: 'schedule', nullable: false })
    schedule: number

    @Column('int', { name: 'limitation', nullable: true })
    limitation: number | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.access_rights)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @ManyToOne(type => AccessRightGroup, access_group => access_group.access_rights)
    @JoinColumn({ name: 'access_group' })
    access_groups: AccessRightGroup;

    @ManyToOne(type => Entry, entry => entry.access_rights)
    @JoinColumn({ name: 'entry' })
    entries: Entry;

    @ManyToOne(type => Schedule, schedule => schedule.access_rights)
    @JoinColumn({ name: 'schedule' })
    schedules: Schedule;

    @ManyToOne(type => Limitation, limitation => limitation.access_rights)
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation;

    public static async addItem (data: AccessRight) {
        const accessRight = new AccessRight()

        accessRight.access_group = data.access_group
        accessRight.entry = data.entry
        accessRight.schedule = data.schedule
        accessRight.limitation = data.limitation
        accessRight.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accessRight)
                .then((item: AccessRight) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccessRight) {
        const accessRight = await this.findOneOrFail(data.id)

        if ('access_group' in data) accessRight.access_group = data.access_group
        if ('entry' in data) accessRight.entry = data.entry
        if ('schedule' in data) accessRight.schedule = data.schedule
        if ('limitation' in data) accessRight.limitation = data.limitation

        if (!accessRight) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accessRight)
                .then((item: AccessRight) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (where: any) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where
            })
                .then((item: AccessRight) => {
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
