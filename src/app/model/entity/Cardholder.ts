import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne,
    OneToMany,
    DeleteDateColumn
} from 'typeorm'
import { cardholderStatus } from '../../enums/cardholderStatus.enum'
import { MainEntity } from './MainEntity'
import { CarInfo } from './CarInfo'
import { Limitation } from './Limitation'
import { AccessRight } from './AccessRight'

import { fileSave } from '../../functions/file'
import { logger } from '../../../../modules/winston/logger'
import fs from 'fs'
import { join } from 'path'
import { CardholderGroup } from './CardholderGroup'
import { Credential } from './Credential'
import { AntipassBack } from './AntipassBack'
import { Schedule } from './Schedule'
import { Admin } from '.'
import { scheduleCustomType } from '../../enums/scheduleCustomType.enum'
const parentDir = join(__dirname, '../../..')

@Entity('cardholder')
export class Cardholder extends MainEntity {
    @Column('varchar', { name: 'email', length: '255', unique: true, nullable: true })
    email: string

    @Column('longtext', { name: 'avatar', nullable: true })
    avatar: string | null

    @Column('varchar', { name: 'password', nullable: true })
    password: string | null

    @Column('varchar', { name: 'first_name', nullable: false })
    first_name: string

    @Column('varchar', { name: 'last_name', nullable: true })
    last_name: string

    @Column('varchar', { name: 'family_name', nullable: true })
    family_name: string

    @Column('varchar', { name: 'verify_token', nullable: true })
    verify_token: string | null

    @Column('varchar', { name: 'phone', nullable: true })
    phone: string

    @Column('varchar', { name: 'company_name', nullable: true })
    company_name: string | null

    @Column('boolean', { name: 'user_account', default: false })
    user_account: boolean

    @Column('boolean', { name: 'vip', default: false })
    vip: boolean

    @Column('int', { name: 'cardholder_group', nullable: true })
    cardholder_group: number

    @Column('int', { name: 'car_info', nullable: true })
    car_info: number | null

    @Column('enum', { name: 'status', enum: cardholderStatus, default: cardholderStatus.INACTIVE })
    status: cardholderStatus

    @Column('boolean', { name: 'guest', default: false })
    guest: boolean

    @Column('longtext', { name: 'extra_features', nullable: true })
    extra_features: string | null

    @Column('int', { name: 'limitation', nullable: false })
    limitation: number

    @Column('boolean', { name: 'limitation_inherited', default: false })
    limitation_inherited: boolean

    @Column('int', { name: 'antipass_back', nullable: true })
    antipass_back: number

    @Column('boolean', { name: 'antipass_back_inherited', default: false })
    antipass_back_inherited: boolean

    @Column('int', { name: 'time_attendance', nullable: true })
    time_attendance: number

    @Column('boolean', { name: 'time_attendance_inherited', default: false })
    time_attendance_inherited: boolean

    @Column('int', { name: 'access_right', nullable: false })
    access_right: number

    @Column('boolean', { name: 'access_right_inherited', default: false })
    access_right_inherited: boolean

    @Column('timestamp', { name: 'last_login_date', nullable: true })
    last_login_date: string | null

    @Column('enum', { name: 'schedule_type', enum: scheduleCustomType, default: scheduleCustomType.DEFAULT })
    schedule_type: scheduleCustomType

    @Column('int', { name: 'schedule', nullable: true })
    schedule: number | null

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('int', { name: 'create_by', nullable: true })
    create_by: number

    @OneToOne(() => CarInfo, car_info => car_info.cardholders, { nullable: true })
    @JoinColumn({ name: 'car_info' })
    car_infos: CarInfo | null;

    @ManyToOne(() => CardholderGroup, cardholder_group => cardholder_group.cardholders, { nullable: true })
    @JoinColumn({ name: 'cardholder_group' })
    cardholder_groups: CardholderGroup | null;

    @ManyToOne(type => Limitation, limitation => limitation.cardholders, { nullable: true })
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation | null;

    @ManyToOne(type => AntipassBack, antipass_back => antipass_back.cardholders, { nullable: true })
    @JoinColumn({ name: 'antipass_back' })
    antipass_backs: AntipassBack | null;

    @ManyToOne(type => Schedule, schedule => schedule.cardholders, { nullable: true })
    @JoinColumn({ name: 'time_attendance' })
    time_attendances: Schedule | null;

    @ManyToOne(() => AccessRight, access_right => access_right.cardholders)
    @JoinColumn({ name: 'access_right' })
    access_rights: AccessRight;

    @OneToMany(type => Credential, credential => credential.cardholders)
    credentials: Credential[];

    @OneToOne(() => Admin, admin => admin.cardholders)
    admins: Admin;

    public static resource: boolean = true

    public static async addItem (data: Cardholder): Promise<Cardholder> {
        const cardholder = new Cardholder()

        cardholder.email = data.email
        if ('avatar' in data) cardholder.avatar = data.avatar
        cardholder.password = data.password
        cardholder.first_name = data.first_name
        cardholder.last_name = data.last_name
        cardholder.family_name = data.family_name
        cardholder.phone = data.phone
        if ('company_name' in data) cardholder.company_name = data.company_name
        if ('user_account' in data) cardholder.user_account = data.user_account
        cardholder.cardholder_group = data.cardholder_group
        if ('car_info' in data) cardholder.car_info = data.car_info
        cardholder.status = data.status
        if ('extra_features' in data) cardholder.extra_features = data.extra_features
        cardholder.limitation = data.limitation
        if ('limitation_inherited' in data) cardholder.limitation_inherited = data.limitation_inherited
        cardholder.antipass_back = data.antipass_back
        if ('antipass_back_inherited' in data) cardholder.antipass_back_inherited = data.antipass_back_inherited
        cardholder.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholder.time_attendance_inherited = data.time_attendance_inherited
        cardholder.access_right = data.access_right
        if ('access_right_inherited' in data) cardholder.access_right_inherited = data.access_right_inherited
        if ('guest' in data) cardholder.guest = data.guest
        if ('schedule_type' in data) cardholder.schedule_type = data.schedule_type
        if ('schedule' in data) cardholder.schedule = data.schedule
        if ('vip' in data) cardholder.vip = data.vip

        cardholder.create_by = data.create_by
        cardholder.company = data.company

        return new Promise((resolve, reject) => {
            this.save(cardholder)
                .then((item: Cardholder) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any, auth_user: any): Promise<{ [key: string]: any }> {
        const cardholder = await this.findOneOrFail({ id: data.id })
        const oldData = Object.assign({}, cardholder)

        let group_data: any
        if (data.limitation_inherited || data.antipass_back_inherited || data.time_attendance_inherited || data.access_right_inherited) {
            if (data.cardholder_group) {
                group_data = await CardholderGroup.getItem({ id: data.cardholder_group, company: auth_user.company ? auth_user.company : null })
            } else {
                group_data = await CardholderGroup.getItem({ id: oldData.cardholder_group, company: auth_user.company ? auth_user.company : null })
            }
        }

        if (data.limitation_inherited && group_data) {
            data.limitation = group_data.limitation
        } else {
            if (auth_user.cardholder || data.limitation_inherited === oldData.limitation_inherited) {
                if (data.limitations) await Limitation.updateItem(data.limitations as Limitation)
            } else {
                const limitation_data: any = await Limitation.addItem(data.limitations as Limitation)
                data.limitation = limitation_data.id
            }
        }

        if (data.antipass_back_inherited && group_data) {
            data.antipass_back = group_data.antipass_back
        } else {
            if (data.antipass_back_inherited === oldData.antipass_back_inherited) {
                await AntipassBack.updateItem(data.antipass_backs as AntipassBack)
            } else {
                if (data.antipass_backs) {
                    const antipass_back_data: any = await AntipassBack.addItem(data.antipass_backs as AntipassBack)
                    data.antipass_back = antipass_back_data.id
                }
            }
        }

        if (data.access_right_inherited && group_data) {
            data.access_right = group_data.access_right
        }

        if (data.time_attendance_inherited && group_data) {
            data.time_attendance = group_data.time_attendance
        }

        if (data.car_infos) {
            await CarInfo.updateItem(data.car_infos)
        }

        if ('email' in data) cardholder.email = data.email
        if ('avatar' in data) cardholder.avatar = data.avatar
        if ('password' in data) cardholder.password = data.password
        if ('first_name' in data) cardholder.first_name = data.first_name
        if ('last_name' in data) cardholder.last_name = data.last_name
        if ('family_name' in data) cardholder.family_name = data.family_name
        if ('phone' in data) cardholder.phone = data.phone
        if ('company_name' in data) cardholder.company_name = data.company_name
        if ('user_account' in data) cardholder.user_account = data.user_account
        if ('cardholder_group' in data) cardholder.cardholder_group = data.cardholder_group
        if ('status' in data) cardholder.status = data.status
        if ('extra_features' in data) cardholder.extra_features = data.extra_features
        if ('limitation' in data) cardholder.limitation = data.limitation
        if ('limitation_inherited' in data) cardholder.limitation_inherited = data.limitation_inherited
        if ('antipass_back' in data) cardholder.antipass_back = data.antipass_back
        if ('antipass_back_inherited' in data) cardholder.antipass_back_inherited = data.antipass_back_inherited
        if ('time_attendance' in data) cardholder.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholder.time_attendance_inherited = data.time_attendance_inherited
        if ('access_right' in data) cardholder.access_right = data.access_right
        if ('access_right_inherited' in data) cardholder.access_right_inherited = data.access_right_inherited
        if ('schedule_type' in data) cardholder.schedule_type = data.schedule_type
        if ('schedule' in data) cardholder.schedule = data.schedule
        if ('vip' in data) cardholder.vip = data.vip

        if (!cardholder) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cardholder)
                .then((item: Cardholder) => {
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
                .then((item: Cardholder) => {
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

    public static async getAllItems (params?: any): Promise<Cardholder[] | []> {
        return new Promise((resolve, reject) => {
            this.findByParams(params)
                .then((items: Cardholder[]) => {
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
