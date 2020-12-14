import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne
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
const parentDir = join(__dirname, '../../..')

@Entity('cardholder')
export class Cardholder extends MainEntity {
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

    @Column('int', { name: 'access_right', nullable: true })
    access_right: number | null

    @Column('int', { name: 'cardholder_group', nullable: true })
    cardholder_group: number | null

    @Column('int', { name: 'car_info', nullable: false })
    car_info: number

    @Column('int', { name: 'limitation', nullable: false })
    limitation: number

    @Column('enum', { name: 'status', enum: cardholderStatus, default: cardholderStatus.inactive })
    status: cardholderStatus

    @Column('boolean', { name: 'antipassback', default: false })
    antipassback: boolean

    @Column('timestamp', { name: 'last_login_date', nullable: true })
    last_login_date: string | null

    @OneToOne(() => CarInfo, car_info => car_info.cardholders, { nullable: true })
    @JoinColumn({ name: 'car_info' })
    car_infos: CarInfo | null;

    @OneToOne(() => Limitation, limitation => limitation.cardholders, { nullable: true })
    @JoinColumn({ name: 'limitation' })
    limitations: Limitation | null;

    @ManyToOne(() => AccessRight, access_right => access_right.cardholders, { nullable: true })
    @JoinColumn({ name: 'access_right' })
    access_rights: AccessRight | null;

    @ManyToOne(() => CardholderGroup, cardholder_group => cardholder_group.cardholders, { nullable: true })
    @JoinColumn({ name: 'cardholder_group' })
    cardholder_groups: CardholderGroup | null;

    public static resource: boolean = true

    public static async addItem (data: Cardholder) {
        const cardholder = new Cardholder()

        cardholder.email = data.email
        cardholder.avatar = data.avatar
        cardholder.password = data.password
        cardholder.first_name = data.first_name
        cardholder.last_name = data.last_name
        cardholder.family_name = data.family_name
        cardholder.phone = data.phone
        cardholder.company = data.company
        cardholder.company_name = data.company_name
        cardholder.role = data.role
        cardholder.access_right = data.access_right
        cardholder.cardholder_group = data.cardholder_group
        cardholder.car_info = data.car_info
        cardholder.limitation = data.limitation
        cardholder.status = data.status
        cardholder.antipassback = data.antipassback
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

    public static async updateItem (data: Cardholder) {
        const cardholder = await this.findOneOrFail(data.id)

        if ('email' in data) cardholder.email = data.email
        if ('avatar' in data) cardholder.avatar = data.avatar
        if ('password' in data) cardholder.password = data.password
        if ('first_name' in data) cardholder.first_name = data.first_name
        if ('last_name' in data) cardholder.last_name = data.last_name
        if ('family_name' in data) cardholder.family_name = data.family_name
        if ('phone' in data) cardholder.phone = data.phone
        if ('company' in data) cardholder.company = data.company
        if ('company_name' in data) cardholder.company_name = data.company_name
        if ('role' in data) cardholder.role = data.role
        if ('access_right' in data) cardholder.access_right = data.access_right
        if ('cardholder_group' in data) cardholder.cardholder_group = data.cardholder_group
        if ('status' in data) cardholder.status = data.status
        if ('antipassback' in data) cardholder.antipassback = data.antipassback

        if (!cardholder) return { status: 400, messsage: 'Item not found' }
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
