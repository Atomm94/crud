import {
    Entity,
    Column,
    ManyToOne,
    // OneToMany,
    JoinColumn,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { AccessRight } from './AccessRight'
import { Cardholder } from '.'
// import { Cardholder } from './Cardholder'

@Entity('cardholder_group')
export class CardholderGroup extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('longtext', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'parent__id', nullable: true })
    parent__id: number | null

    @Column('int', { name: 'limitation', nullable: true })
    limitation: number | null

    @Column('boolean', { name: 'limitation_inherited', default: false })
    limitation_inherited: boolean

    @Column('int', { name: 'anti_pass_back', nullable: true })
    anti_pass_back: number | null

    @Column('boolean', { name: 'anti_pass_back_inherited', default: false })
    anti_pass_back_inherited: boolean

    @Column('int', { name: 'time_attendance', nullable: true })
    time_attendance: number | null

    @Column('boolean', { name: 'time_attendance_inherited', default: false })
    time_attendance_inherited: boolean

    @Column('int', { name: 'access_right', nullable: true })
    access_right: number | null

    @Column('boolean', { name: 'access_rights_inherited', default: false })
    access_rights_inherited: boolean

    @OneToMany(type => Cardholder, cardholder => cardholder.cardholder_groups)
    cardholders: Cardholder[];

    @ManyToOne(type => AccessRight, access_rights => access_rights.cardholder_groups, { nullable: true })
    @JoinColumn({ name: 'access_rights' })
    access_rights: AccessRight | null;

    public static async addItem (data: CardholderGroup) {
        const cardholderGroup = new CardholderGroup()

        cardholderGroup.name = data.name
        cardholderGroup.description = data.description
        cardholderGroup.parent__id = data.parent__id
        cardholderGroup.limitation = data.limitation
        cardholderGroup.limitation_inherited = data.limitation_inherited
        cardholderGroup.anti_pass_back = data.anti_pass_back
        cardholderGroup.anti_pass_back_inherited = data.anti_pass_back_inherited
        cardholderGroup.time_attendance = data.time_attendance
        cardholderGroup.time_attendance_inherited = data.time_attendance_inherited
        cardholderGroup.access_right = data.access_right
        cardholderGroup.access_rights_inherited = data.access_rights_inherited

        return new Promise((resolve, reject) => {
            this.save(cardholderGroup)
                .then((item: CardholderGroup) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CardholderGroup) {
        const cardholderGroup = await this.findOneOrFail(data.id)

        if ('name' in data) cardholderGroup.name = data.name
        if ('description' in data) cardholderGroup.description = data.description
        if ('parent__id' in data) cardholderGroup.parent__id = data.parent__id
        if ('limitation' in data) cardholderGroup.limitation = data.limitation
        if ('limitation_inherited' in data) cardholderGroup.limitation_inherited = data.limitation_inherited
        if ('anti_pass_back' in data) cardholderGroup.anti_pass_back = data.anti_pass_back
        if ('anti_pass_back_inherited' in data) cardholderGroup.anti_pass_back_inherited = data.anti_pass_back_inherited
        if ('time_attendance' in data) cardholderGroup.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholderGroup.time_attendance_inherited = data.time_attendance_inherited
        if ('access_rights' in data) cardholderGroup.access_right = data.access_right
        if ('access_rights_inherited' in data) cardholderGroup.access_rights_inherited = data.access_rights_inherited

        if (!cardholderGroup) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cardholderGroup)
                .then((item: CardholderGroup) => {
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
                .then((item: CardholderGroup) => {
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
