import {
    Entity,
    Column
} from 'typeorm'

import { MainEntityColumns } from './MainEntityColumns'
import { uid } from 'uid'
import { Sendgrid } from '../../../component/sendgrid/sendgrid'
import { PackageType } from './PackageType'

@Entity('registration_invite')
export class RegistrationInvite extends MainEntityColumns {
    @Column('varchar', { name: 'email' })
    email: string

    @Column('varchar', { name: 'token', unique: true })
    token: string

    @Column('boolean', { name: 'used', default: false })
    used: boolean

    @Column('int', { name: 'company', nullable: true })
    company: number | null

    // public static async addItem (data: RegistrationInvite) {
    //     const registrationInvite = new RegistrationInvite()

    //     registrationInvite.email = data.email
    //     registrationInvite.token = data.token
    //     registrationInvite.used = data.used

    //     return new Promise((resolve, reject) => {
    //         this.save(registrationInvite, { transaction: false })
    //             .then((item: RegistrationInvite) => {
    //                 resolve(item)
    //             })
    //             .catch((error: any) => {
    //                 reject(error)
    //             })
    //     })
    // }

    // public static async updateItem (data: RegistrationInvite) {
    //     const registrationInvite = await this.findOneOrFail({ where: {id: data.id })

    //     if ('email' in data) registrationInvite.email = data.email
    //     if ('token' in data) registrationInvite.token = data.token
    //     if ('used' in data) registrationInvite.used = data.used

    //     if (!registrationInvite) return { status: 400, message: 'Item not found' }
    //     return new Promise((resolve, reject) => {
    //         this.save(registrationInvite, { transaction: false })
    //             .then((item: RegistrationInvite) => {
    //                 resolve(item)
    //             })
    //             .catch((error: any) => {
    //                 reject(error)
    //             })
    //     })
    // }

    // public static async getItem (id: number) {
    //     const itemId: number = id
    //     return new Promise((resolve, reject) => {
    //         this.findOneOrFail({where:{id:itemId}})
    //             .then((item: RegistrationInvite) => {
    //                 resolve(item)
    //             })
    //             .catch((error: any) => {
    //                 reject(error)
    //             })
    //     })
    // }

    // public static async destroyItem (data: { id: number }) {
    //     const itemId: number = +data.id
    // // eslint-disable-next-line no-async-promise-executor
    //     return new Promise(async (resolve, reject) => {
    //           this.remove(await this.findByIds([itemId]))
    //             .then(() => {
    //                 resolve({ message: 'success' })
    //             })
    //             .catch((error: any) => {
    //                 reject(error)
    //             })
    //     })
    // }

    // public static async getAllItems (params?: any) {
    //     return new Promise((resolve, reject) => {
    //         this.findByParams(params)
    //             .then((items) => {
    //                 resolve(items)
    //             })
    //             .catch((error: any) => {
    //                 reject(error)
    //             })
    //     })
    // }

    public static async createLink (data: any) {
        const registrationInvite = new RegistrationInvite()

        registrationInvite.email = data.email
        registrationInvite.token = uid(32)
        if ('company' in data) registrationInvite.company = data.company

        return new Promise((resolve, reject) => {
            this.save(registrationInvite, { transaction: false })
                .then(async (item: RegistrationInvite) => {
                    await Sendgrid.sendInvite(item.email, item.token)
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async createPartitionLink (data: any) {
        const registrationInvite = new RegistrationInvite()

        registrationInvite.email = data.email
        registrationInvite.token = uid(32)
        if ('company' in data) registrationInvite.company = data.company

        return new Promise((resolve, reject) => {
            this.save(registrationInvite, { transaction: false })
                .then(async (item: RegistrationInvite) => {
                    await Sendgrid.sendPartitionInvite(item.email, item.token)
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async createCardholderLink (data: any) {
        const registrationInvite = new RegistrationInvite()

        registrationInvite.email = data.email
        registrationInvite.token = uid(32)

        return new Promise((resolve, reject) => {
            this.save(registrationInvite, { transaction: false })
                .then(async (item: RegistrationInvite) => {
                    await Sendgrid.sendCardholderInvite(item.email, item.token)
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getByLink (token: any) {
        try {
            const regToken = await RegistrationInvite.findOneOrFail({ where: { token: token, used: false } })
            if (regToken) {
                const packageTypes = await PackageType.getAllItems({ where: { status: { '=': true } } })
                return packageTypes
            } else {
                return false
            }
        } catch (error) {
            return error
        }
    }
}
