import {
    Entity,
    Column
} from 'typeorm'
import { userStatus } from '../../enums/userStatus.enum'

import { MainEntity } from './MainEntity'

@Entity('user')
export class User extends MainEntity {
    @Column('varchar', { name: 'email', length: '255', unique: true })
    email: string

    @Column('longtext', { name: 'avatar', nullable: true })
    avatar: string | null

    @Column('varchar', { name: 'password', nullable: true })
    password: string | null

    @Column('varchar', { name: 'first_name', nullable: false, required: true })
    first_name: string

    @Column('varchar', { name: 'last_name', nullable: false, required: true })
    last_name: string

    @Column('varchar', { name: 'family_name', nullable: false, required: true })
    family_name: string

    @Column('varchar', { name: 'verify_token', nullable: true })
    verify_token: string | null

    @Column('varchar', { name: 'phone', nullable: false, required: true })
    phone: string

    @Column('int', { name: 'company', nullable: true })
    company: number | null

    @Column('varchar', { name: 'company_name', nullable: true })
    company_name: string | null

    @Column('int', { name: 'role', nullable: true })
    role: number | null

    @Column('int', { name: 'access_right', nullable: true })
    access_right: number | null

    @Column('int', { name: 'user_group', nullable: true })
    user_group: number | null

    @Column('varchar', { name: 'status', default: 'Inactive' })
    status: userStatus

    @Column('timestamp', { name: 'last_login_date', nullable: true })
    last_login_date: string | null

    public static async addItem (data: User) {
        const user = new User()

        user.email = data.email
        user.avatar = data.avatar
        user.password = data.password
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.family_name = data.family_name
        user.verify_token = data.verify_token
        user.phone = data.phone
        user.company = data.company
        user.company_name = data.company_name
        user.role = data.role
        user.access_right = data.access_right
        user.user_group = data.user_group
        user.status = data.status
        user.last_login_date = data.last_login_date

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
        if ('verify_token' in data) user.verify_token = data.verify_token
        if ('phone' in data) user.phone = data.phone
        if ('company' in data) user.company = data.company
        if ('company_name' in data) user.company_name = data.company_name
        if ('role' in data) user.role = data.role
        if ('access_right' in data) user.access_right = data.access_right
        if ('user_group' in data) user.user_group = data.user_group
        if ('status' in data) user.status = data.status
        if ('last_login_date' in data) user.last_login_date = data.last_login_date

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

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail(itemId)
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
