
import {
    Entity,
    Column
} from 'typeorm'

import { MainEntityColumns } from './MainEntityColumns'

@Entity('zoho')
export class Zoho extends MainEntityColumns {
    @Column('varchar', { name: 'client_id', nullable: false })
    client_id: string

    @Column('varchar', { name: 'client_secret', nullable: false })
    client_secret: string

    @Column('varchar', { name: 'code', nullable: false })
    code: string

    @Column('varchar', { name: 'scope', nullable: false })
    scope: string

    @Column('varchar', { name: 'redirect_uri', nullable: false })
    redirect_uri: string

    @Column('varchar', { name: 'product_id', nullable: false })
    product_id: string

    @Column('varchar', { name: 'organization_id', nullable: false })
    organization_id: string

    @Column('varchar', { name: 'access_token', nullable: false })
    access_token: string

    @Column('varchar', { name: 'refresh_token', nullable: false })
    refresh_token: string

    @Column('varchar', { name: 'token_expire_time', nullable: true })
    token_expire_time: string

    public static async addItem (data: Zoho): Promise<Zoho> {
        const zoho = new Zoho()

        zoho.client_id = data.client_id
        zoho.client_secret = data.client_secret
        zoho.code = data.code
        zoho.scope = data.scope
        zoho.redirect_uri = data.redirect_uri
        zoho.product_id = data.product_id
        zoho.organization_id = data.organization_id
        zoho.access_token = data.access_token
        zoho.refresh_token = data.refresh_token

        return new Promise((resolve, reject) => {
            this.save(zoho, { transaction: false })
                .then((item: Zoho) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Zoho): Promise<{ [key: string]: any }> {
        const zoho = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, zoho)

        if ('client_id' in data) zoho.client_id = data.client_id
        if ('client_secret' in data) zoho.client_secret = data.client_secret
        if ('code' in data) zoho.code = data.code
        if ('scope' in data) zoho.scope = data.scope
        if ('redirect_uri' in data) zoho.redirect_uri = data.redirect_uri
        if ('product_id' in data) zoho.product_id = data.product_id
        if ('organization_id' in data) zoho.organization_id = data.organization_id
        if ('access_token' in data) zoho.access_token = data.access_token
        if ('refresh_token' in data) zoho.refresh_token = data.refresh_token

        if (!zoho) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(zoho, { transaction: false })
                .then((item: Zoho) => {
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
                .then((item: Zoho) => {
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
            this.remove(await this.findOneOrFail({ where: { id: data.id } }))
                .then(async () => {
                    resolve({ message: 'success' })
                })
                .catch(() => {
                    resolve({ message: 'Zoho delete failed' })
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
