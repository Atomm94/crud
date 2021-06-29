import {
    Entity,
    Column,
    ManyToOne,
    // OneToMany,
    JoinColumn,
    OneToMany,
    DeleteDateColumn
} from 'typeorm'
import { AntipassBack } from './AntipassBack'

import {
    Cardholder,
    Limitation,
    MainEntity,
    AccessRight,
    Schedule
} from './index'
// import { Cardholder } from './Cardholder'

@Entity('cardholder_group')
export class CardholderGroup extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('longtext', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @Column('int', { name: 'limitation', nullable: false })
    limitation: number

    @Column('boolean', { name: 'limitation_inherited', default: false })
    limitation_inherited: boolean

    @Column('int', { name: 'antipass_back', nullable: false })
    antipass_back: number

    @Column('boolean', { name: 'antipass_back_inherited', default: false })
    antipass_back_inherited: boolean

    @Column('int', { name: 'time_attendance', nullable: false })
    time_attendance: number

    @Column('boolean', { name: 'time_attendance_inherited', default: false })
    time_attendance_inherited: boolean

    @Column('int', { name: 'access_right', nullable: false })
    access_right: number

    @Column('boolean', { name: 'access_right_inherited', default: false })
    access_right_inherited: boolean

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @OneToMany(type => Cardholder, cardholder => cardholder.cardholder_groups)
    cardholders: Cardholder[];

    @ManyToOne(type => Limitation, limitation => limitation.cardholder_groups, { nullable: true })
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation | null;

    @ManyToOne(type => AntipassBack, antipass_back => antipass_back.cardholder_groups, { nullable: true })
    @JoinColumn({ name: 'antipass_back' })
    antipass_backs: AntipassBack | null;

    @ManyToOne(type => Schedule, schedule => schedule.cardholder_groups, { nullable: true })
    @JoinColumn({ name: 'time_attendance' })
    time_attendances: Schedule | null;

    @ManyToOne(type => AccessRight, access_right => access_right.cardholder_groups, { nullable: true })
    @JoinColumn({ name: 'access_right' })
    access_rights: AccessRight | null;

    public static resource: boolean = true

    public static async addItem (data: CardholderGroup) {
        const cardholderGroup = new CardholderGroup()

        cardholderGroup.name = data.name
        if ('description' in data) cardholderGroup.description = data.description
        if ('parent_id' in data) cardholderGroup.parent_id = data.parent_id
        cardholderGroup.limitation = data.limitation
        if ('limitation_inherited' in data) cardholderGroup.limitation_inherited = data.limitation_inherited
        cardholderGroup.antipass_back = data.antipass_back
        if ('antipass_back_inherited' in data) cardholderGroup.antipass_back_inherited = data.antipass_back_inherited
        cardholderGroup.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholderGroup.time_attendance_inherited = data.time_attendance_inherited
        cardholderGroup.access_right = data.access_right
        if ('access_right_inherited' in data) cardholderGroup.access_right_inherited = data.access_right_inherited
        cardholderGroup.company = data.company

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

    public static async updateItem (data: any, user: any): Promise<{ [key: string]: any }> {
        const cardholderGroup = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, cardholderGroup)

        let parent_data: any
        if (data.limitation_inherited || data.antipass_back_inherited || data.time_attendance_inherited || data.access_right_inherited) {
            parent_data = await CardholderGroup.getItem({ id: oldData.parent_id, company: user.company ? user.company : null })
        }

        if (data.limitation_inherited && parent_data) {
            data.limitation = parent_data.limitation
        } else {
            if (data.limitation_inherited === oldData.limitation_inherited) {
                await Limitation.updateItem(data.limitations as Limitation)
            } else {
                const limitation_data: any = await Limitation.addItem(data.limitations as Limitation)
                data.limitation = limitation_data.id
            }
        }

        if (data.antipass_back_inherited && parent_data) {
            data.antipass_back = parent_data.antipass_back
        } else {
            if (data.antipass_back_inherited === oldData.antipass_back_inherited) {
                await AntipassBack.updateItem(data.antipass_backs as AntipassBack)
            } else {
                const antipass_back_data: any = await AntipassBack.addItem(data.antipass_backs as AntipassBack)
                data.antipass_back = antipass_back_data.id
            }
        }

        if (data.access_right_inherited && parent_data) {
            data.access_right = parent_data.access_right
        }

        if (data.time_attendance_inherited && parent_data) {
            data.time_attendance = parent_data.time_attendance
        }

        if ('name' in data) cardholderGroup.name = data.name
        if ('description' in data) cardholderGroup.description = data.description
        if ('parent_id' in data) cardholderGroup.parent_id = data.parent_id
        if ('limitation' in data) cardholderGroup.limitation = data.limitation
        if ('limitation_inherited' in data) cardholderGroup.limitation_inherited = data.limitation_inherited
        if ('antipass_back' in data) cardholderGroup.antipass_back = data.antipass_back
        if ('antipass_back_inherited' in data) cardholderGroup.antipass_back_inherited = data.antipass_back_inherited
        if ('time_attendance' in data) cardholderGroup.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholderGroup.time_attendance_inherited = data.time_attendance_inherited
        if ('access_right' in data) cardholderGroup.access_right = data.access_right
        if ('access_right_inherited' in data) cardholderGroup.access_right_inherited = data.access_right_inherited

        if (!cardholderGroup) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cardholderGroup)
                .then((item: CardholderGroup) => {
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

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: CardholderGroup) => {
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
            this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
                this.softRemove(data)
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
