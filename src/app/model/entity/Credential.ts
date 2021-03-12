import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm'

import { MainEntity } from './index'
import { credentialType } from '../../enums/credentialType.enum'
import { credentialStatus } from '../../enums/credentialStatus.enum'
import { credentialInputMode } from '../../enums/credentialInputMode.enum'
import { Cardholder } from './Cardholder'

@Entity('credential')
export class Credential extends MainEntity {
    @Column('enum', { name: 'type', enum: credentialType })
    type: credentialType

    @Column('longtext', { name: 'code' })
    code: string

    @Column('enum', { name: 'status', enum: credentialStatus })
    status: credentialStatus

    @Column('int', { name: 'cardholder' })
    cardholder: number

    @Column('int', { name: 'facility' })
    facility: number

    @Column('enum', { name: 'input_mode', enum: credentialInputMode })
    input_mode: credentialInputMode

    @Column('int', { name: 'company', nullable: false, unique: true })
    company: number

    @ManyToOne(type => Cardholder, cardholder => cardholder.credentials)
    @JoinColumn({ name: 'cardholder' })
    cardholders: Cardholder;

    public static async addItem (data: Credential) {
        const credential = new Credential()

        credential.type = data.type
        credential.code = data.code
        credential.status = data.status
        credential.cardholder = data.cardholder
        credential.facility = data.facility
        credential.input_mode = data.input_mode
        credential.company = data.company

        return new Promise((resolve, reject) => {
            this.save(credential)
                .then((item: Credential) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Credential) {
        const credential = await this.findOneOrFail(data.id)

        if ('type' in data) credential.type = data.type
        if ('code' in data) credential.code = data.code
        if ('status' in data) credential.status = data.status
        if ('cardholder' in data) credential.cardholder = data.cardholder
        if ('facility' in data) credential.facility = data.facility
        if ('input_mode' in data) credential.input_mode = data.input_mode

        if (!credential) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(credential)
                .then((item: Credential) => {
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
                where: where
            })
                .then((item: Credential) => {
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
