import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne
} from 'typeorm'
import { userStatus } from '../../enums/userStatus.enum'
import { MainEntity } from './MainEntity'
import { CarInfo } from './CarInfo'
import { Limitation } from './Limitation'
import { AccessRightGroup } from './AccessRightGroup'

import { fileSave } from '../../functions/file'
import { logger } from '../../../../modules/winston/logger'
import fs from 'fs'
import { join } from 'path'
const parentDir = join(__dirname, '../../..')
@Entity('user')
export class User extends MainEntity {
    @Column('varchar', { name: 'email', length: '255', unique: true })
    email: string

    @Column('longtext', { name: 'avatar', nullable: true })
    avatar: string | null

    @Column('varchar', { name: 'password', nullable: true })
    password: string | null

    @Column('varchar', { name: 'first_name', nullable: false })
    first_name: string

    @Column('varchar', { name: 'last_name', nullable: false })
    last_name: string

    @Column('varchar', { name: 'family_name', nullable: false })
    family_name: string

    @Column('varchar', { name: 'verify_token', nullable: true })
    verify_token: string | null

    @Column('varchar', { name: 'phone', nullable: false })
    phone: string

    @Column('int', { name: 'company', nullable: true })
    company: number | null

    @Column('varchar', { name: 'company_name', nullable: true })
    company_name: string | null

    @Column('int', { name: 'role', nullable: true })
    role: number | null

    @Column('int', { name: 'access_right_group', nullable: true })
    access_right_group: number | null

    @Column('int', { name: 'user_group', nullable: true })
    user_group: number | null

    @Column('int', { name: 'car_info', nullable: false })
    car_info: number

    @Column('int', { name: 'limitation', nullable: false })
    limitation: number

    @Column('enum', { name: 'status', enum: userStatus, default: userStatus.inactive })
    status: userStatus

    @Column('boolean', { name: 'antipassback', default: false })
    antipassback: boolean

    @Column('timestamp', { name: 'last_login_date', nullable: true })
    last_login_date: string | null

    @OneToOne(() => CarInfo, car_info => car_info.user, { nullable: true })
    @JoinColumn({ name: 'car_info' })
    car_infos: CarInfo | null;

    @OneToOne(() => Limitation, limitation => limitation.user, { nullable: true })
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation | null;

    @ManyToOne(() => AccessRightGroup, access_right_group => access_right_group.user, { nullable: true })
    @JoinColumn({ name: 'access_right_group' })
    access_right_groups: AccessRightGroup;

    public static resource: boolean = true

    public static async addItem (data: User) {
        const user = new User()

        user.email = data.email
        user.avatar = data.avatar
        user.password = data.password
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.family_name = data.family_name
        user.phone = data.phone
        user.company = data.company
        user.company_name = data.company_name
        user.role = data.role
        user.access_right_group = data.access_right_group
        user.user_group = data.user_group
        user.car_info = data.car_info
        user.limitation = data.limitation
        user.status = data.status
        user.antipassback = data.antipassback
        user.company = data.company

        return new Promise((resolve, reject) => {
            this.save(user)
                .then((item: User) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: User) {
        const user = await this.findOneOrFail(data.id)

        if ('email' in data) user.email = data.email
        if ('avatar' in data) user.avatar = data.avatar
        if ('password' in data) user.password = data.password
        if ('first_name' in data) user.first_name = data.first_name
        if ('last_name' in data) user.last_name = data.last_name
        if ('family_name' in data) user.family_name = data.family_name
        if ('phone' in data) user.phone = data.phone
        if ('company' in data) user.company = data.company
        if ('company_name' in data) user.company_name = data.company_name
        if ('role' in data) user.role = data.role
        if ('access_right_group' in data) user.access_right_group = data.access_right_group
        if ('user_group' in data) user.user_group = data.user_group
        if ('status' in data) user.status = data.status
        if ('antipassback' in data) user.antipassback = data.antipassback

        if (!user) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(user)
                .then((item: User) => {
                    resolve(item)
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
                .then((item: User) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (data: { id: number }) {
        const itemId: number = +data.id
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.remove(await this.findByIds([itemId]))
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
