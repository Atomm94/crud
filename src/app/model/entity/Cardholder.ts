import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne,
    OneToMany,
    DeleteDateColumn,
    Index
} from 'typeorm'
import { cardholderStatus } from '../../enums/cardholderStatus.enum'
import { MainEntity } from './MainEntity'
import { CarInfo } from './CarInfo'
import { Limitation } from './Limitation'
import { AccessRight } from './AccessRight'
import { AccessRule } from './AccessRule'
import { fileSave } from '../../functions/file'
import { logger } from '../../../../modules/winston/logger'
import fs from 'fs'
import { join } from 'path'
import { CardholderGroup } from './CardholderGroup'
import { Credential } from './Credential'
import { AntipassBack } from './AntipassBack'
import { Schedule } from './Schedule'
import { Admin } from '.'
import { guestKeyType } from '../../enums/guestKeyType.enum'
import { minusResource } from '../../functions/minusResource'
import { logUserEvents } from '../../enums/logUserEvents.enum'
import { cardholderPresense } from '../../enums/cardholderPresense.enum'
import { getObjectDiff } from '../../functions/checkDifference'
import { cardholderGuestCount } from '../../enums/cardholderGuestCount.enum'
import { guestPeriod } from '../../enums/guestPeriod.enum'
import LogController from '../../controller/LogController'

const parentDir = join(__dirname, '../../..')
@Index('email|company|is_delete', ['email', 'company', 'is_delete'], { unique: true })
@Index('cardholder_delete_date', ['deleteDate'])
@Index('cardholder_company', ['company'])
@Entity('cardholder')
export class Cardholder extends MainEntity {
    @Column('varchar', { name: 'email', length: '255', nullable: true })
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

    @Column('enum', { name: 'status', enum: cardholderStatus, default: cardholderStatus.ACTIVE })
    status: cardholderStatus

    @Column('boolean', { name: 'guest', default: false })
    guest: boolean

    @Column('longtext', { name: 'extra_features', nullable: true })
    extra_features: string | null

    @Column('int', { name: 'limitation', nullable: true })
    limitation: number | null

    @Column('boolean', { name: 'limitation_inherited', default: false })
    limitation_inherited: boolean

    @Column('boolean', { name: 'enable_antipass_back', default: false })
    enable_antipass_back: boolean

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

    @Column('enum', { name: 'key_type', enum: guestKeyType, default: guestKeyType.TEMPORARY })
    key_type: guestKeyType

    @Column('enum', { name: 'period', enum: guestPeriod, default: guestPeriod.HOURS })
    period: guestPeriod

    @Column('int', { name: 'duration', nullable: true })
    duration: number | null

    @Column('timestamp', { name: 'start_date', nullable: true })
    start_date: Date

    @Column('timestamp', { name: 'end_date', nullable: true })
    end_date: Date

    @Column('longtext', { name: 'days_of_week', nullable: true })
    days_of_week: string | null

    @Column('varchar', { name: 'start_time', nullable: true })
    start_time: string | null

    @Column('varchar', { name: 'end_time', nullable: true })
    end_time: string | null

    @Column('int', { name: 'selected_access_point', nullable: true })
    selected_access_point: number | null

    @Column('enum', { name: 'presense', enum: cardholderPresense, default: cardholderPresense.ABSENT_NO_REASON })
    presense: cardholderPresense

    @Column('enum', { name: 'guest_count', enum: cardholderGuestCount, default: cardholderGuestCount.FOUR })
    guest_count: number

    @Column('boolean', { name: 'enable_create_guest', default: true })
    enable_create_guest: boolean

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('int', { name: 'create_by', nullable: true })
    create_by: number

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @OneToOne(() => CarInfo, car_info => car_info.cardholders, { nullable: true })
    @JoinColumn({ name: 'car_info' })
    car_infos: CarInfo | null;

    @ManyToOne(() => CardholderGroup, cardholder_group => cardholder_group.cardholders, { nullable: true })
    @JoinColumn({ name: 'cardholder_group' })
    cardholder_groups: CardholderGroup | null;

    @ManyToOne(type => Limitation, limitation => limitation.cardholders, { nullable: true })
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation | null;

    // @ManyToOne(type => AntipassBack, antipass_back => antipass_back.cardholders, { nullable: true })
    // @JoinColumn({ name: 'antipass_back' })
    // antipass_backs: AntipassBack | null;

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
        if ('avatar' in data) {
            cardholder.avatar = (data.avatar && typeof data.avatar === 'object') ? JSON.stringify(data.avatar) : data.avatar
        }
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
        cardholder.enable_antipass_back = data.enable_antipass_back
        if ('antipass_back_inherited' in data) cardholder.antipass_back_inherited = data.antipass_back_inherited
        cardholder.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholder.time_attendance_inherited = data.time_attendance_inherited
        cardholder.access_right = data.access_right
        if ('access_right_inherited' in data) cardholder.access_right_inherited = data.access_right_inherited
        if ('guest' in data) cardholder.guest = data.guest
        if ('key_type' in data) cardholder.key_type = data.key_type
        if ('period' in data) cardholder.period = data.period
        if ('duration' in data) cardholder.duration = data.duration
        if ('start_date' in data) cardholder.start_date = data.start_date
        if ('end_date' in data) cardholder.end_date = data.end_date
        if ('days_of_week' in data) {
            cardholder.days_of_week = (data.days_of_week && typeof data.days_of_week === 'object') ? JSON.stringify(data.days_of_week) : data.days_of_week
        }
        if ('start_time' in data) cardholder.start_time = data.start_time
        if ('end_time' in data) cardholder.end_time = data.end_time
        if ('selected_access_point' in data) cardholder.selected_access_point = data.selected_access_point
        if ('vip' in data) cardholder.vip = data.vip
        if ('guest_count' in data) cardholder.guest_count = data.guest_count
        if ('enable_create_guest' in data) cardholder.enable_create_guest = data.enable_create_guest

        cardholder.create_by = data.create_by
        cardholder.company = data.company

        return new Promise((resolve, reject) => {
            this.save(cardholder, { transaction: false })
                .then((item: Cardholder) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any, auth_user: any): Promise<{ [key: string]: any }> {
        const cardholder = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, cardholder)
        const logs_data: any = []

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
                if (data.limitations) {
                    const limitation_data = await Limitation.updateItem(data.limitations as Limitation)
                    const diff_limitation_data = await getObjectDiff(limitation_data.new, limitation_data.old)
                    if (Object.keys(diff_limitation_data).length) {
                        logs_data.push({
                            event: logUserEvents.CHANGE,
                            target: `${Cardholder.name}-${Limitation.name}/${cardholder.first_name}`,
                            value: diff_limitation_data
                        })
                    }
                }
            } else {
                const limitation_data: any = await Limitation.addItem(data.limitations as Limitation)
                data.limitation = limitation_data.id
            }
        }

        // if (data.antipass_back_inherited && group_data) {
        //     data.antipass_back = group_data.antipass_back
        // } else {
        //     if (data.antipass_back_inherited === oldData.antipass_back_inherited) {
        //         const antipass_back_data = await AntipassBack.updateItem(data.antipass_backs as AntipassBack)
        //         const diff_antipass_back_data = getObjectDiff(antipass_back_data.new, antipass_back_data.old)
        //         if (Object.keys(diff_antipass_back_data).length) {
        //             logs_data.push({
        //                 event: logUserEvents.CHANGE,
        //                 target: `${Cardholder.name}-${AntipassBack.name}/${cardholder.first_name}`,
        //                 value: diff_antipass_back_data
        //             })
        //         }
        //     } else {
        //         if (data.antipass_backs) {
        //             const antipass_back_data: any = await AntipassBack.addItem(data.antipass_backs as AntipassBack)
        //             data.antipass_back = antipass_back_data.id
        //         }
        //     }
        // }

        if (data.antipass_back_inherited && group_data) {
            data.enable_antipass_back = group_data.enable_antipass_back
        }

        if (data.access_right_inherited && group_data) {
            data.access_right = group_data.access_right
        }

        if (data.time_attendance_inherited && group_data) {
            data.time_attendance = group_data.time_attendance
        }

        if (data.car_infos) {
            if (!data.car_infos.id) {
                const car_info = await CarInfo.addItem(data.car_infos as CarInfo)
                if (car_info) {
                    cardholder.car_info = car_info.id
                }
            } else {
                const car_info_data = await CarInfo.updateItem(data.car_infos)
                const diff_car_info_data = await getObjectDiff(car_info_data.new, car_info_data.old)
                if (Object.keys(diff_car_info_data).length) {
                    logs_data.push({
                        event: logUserEvents.CHANGE,
                        target: `${Cardholder.name}-${AntipassBack.name}/${cardholder.first_name}`,
                        value: diff_car_info_data
                    })
                }
            }
        }

        if ('email' in data) cardholder.email = data.email
        if ('avatar' in data) {
            cardholder.avatar = (data.avatar && typeof data.avatar === 'object') ? JSON.stringify(data.avatar) : data.avatar
        }
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
        if ('enable_antipass_back' in data) cardholder.enable_antipass_back = data.enable_antipass_back
        if ('antipass_back_inherited' in data) cardholder.antipass_back_inherited = data.antipass_back_inherited
        if ('time_attendance' in data) cardholder.time_attendance = data.time_attendance
        if ('time_attendance_inherited' in data) cardholder.time_attendance_inherited = data.time_attendance_inherited
        if ('access_right' in data) cardholder.access_right = data.access_right
        if ('access_right_inherited' in data) cardholder.access_right_inherited = data.access_right_inherited
        if ('key_type' in data) cardholder.key_type = data.key_type
        if ('period' in data) cardholder.period = data.period
        if ('duration' in data) cardholder.duration = data.duration
        if ('start_date' in data) cardholder.start_date = data.start_date
        if ('end_date' in data) cardholder.end_date = data.end_date
        if ('days_of_week' in data) {
            cardholder.days_of_week = (data.days_of_week && typeof data.days_of_week === 'object') ? JSON.stringify(data.days_of_week) : data.days_of_week
        }
        if ('start_time' in data) cardholder.start_time = data.start_time
        if ('end_time' in data) cardholder.end_time = data.end_time
        if ('selected_access_point' in data) cardholder.selected_access_point = data.selected_access_point
        if ('vip' in data) cardholder.vip = data.vip
        if ('guest_count' in data) cardholder.guest_count = data.guest_count

        if (!cardholder) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(cardholder, { transaction: false })
                .then((item: Cardholder) => {
                    resolve({
                        old: oldData,
                        new: item,
                        logs_data: logs_data
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
            this.findOneOrFail({ where: { id: data.id, company: data.company }, relations: ['credentials'] }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        minusResource(this.name, data.company)
                        // if (data.limitation_inherited === false) {
                        //     Limitation.destroyItem(data.limitation)
                        // }
                        // if (data.antipass_back_inherited === false) {
                        //     AntipassBack.destroyItem(data.antipass_back)
                        // }
                        // if (data.car_info) {
                        //     CarInfo.destroyItem(data.car_info)
                        // }

                        const cardholder_data: any = await this.createQueryBuilder('cardholder')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()

                        cardholder_data.is_delete = (new Date()).getTime()
                        await this.save(cardholder_data, { transaction: false })

                        for (const credential of data.credentials) {
                            if (!credential.deleteDate) {
                                await Credential.destroyItem(credential)
                                const cache_key = `${data.company}:cg_*:acr_*:cr_${credential.id}`
                                await LogController.invalidateCache(cache_key)
                            }
                        }

                        if (cardholder_data.guest) {
                            AccessRight.destroyItem({ id: cardholder_data.access_right, company: cardholder_data.company })
                            const access_rules = await AccessRule.find({ where: { access_right: cardholder_data.access_right } })
                            for (const access_rule of access_rules) {
                                AccessRule.destroyItem({ id: access_rule.id, company: cardholder_data.company })
                                const schedule = await Schedule.findOne({ where: { id: access_rule.schedule } })
                                if (schedule) Schedule.destroyItem({ id: access_rule.schedule, company: cardholder_data.company })
                            }
                        }
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
