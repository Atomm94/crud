import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
    // Unique,
    Index
} from 'typeorm'

import { MainEntity } from './index'
import { credentialType } from '../../enums/credentialType.enum'
import { credentialStatus } from '../../enums/credentialStatus.enum'
import { credentialInputMode } from '../../enums/credentialInputMode.enum'
import { Cardholder } from './Cardholder'

import { minusResource } from '../../functions/minusResource'
import { resourceKeys } from '../../enums/resourceKeys.enum'
import { v4 } from 'uuid'

// @Unique('code', 'company', 'is_delete')

@Index('code|company|is_delete', ['code', 'company', 'is_delete'], { unique: true })

@Entity('credential')
export class Credential extends MainEntity {
    @Column('enum', { name: 'type', enum: credentialType })
    type: credentialType

    @Column('varchar', { name: 'code', length: 512 })
    code: string

    @Column('enum', { name: 'status', enum: credentialStatus, default: credentialStatus.ACTIVE })
    status: credentialStatus

    @Column('int', { name: 'cardholder' })
    cardholder: number

    @Column('int', { name: 'facility', nullable: true })
    facility: number

    @Column('enum', { name: 'input_mode', enum: credentialInputMode })
    input_mode: credentialInputMode

    @Column('boolean', { name: 'isLogin', default: false })
    isLogin: boolean;

    @Column('varchar', { name: 'is_delete', default: 0 })
    is_delete: string

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Cardholder, cardholder => cardholder.credentials)
    @JoinColumn({ name: 'cardholder' })
    cardholders: Cardholder;

    public static async addItem (data: Credential): Promise<Credential> {
        const credential = new Credential()

        credential.type = data.type
        if (data.type === credentialType.VIKEY) {
            credential.code = v4()
        } else {
            credential.code = data.code
        }
        if ('status' in data) {
            credential.status = data.status
        } else {
            credential.status = credentialStatus.ACTIVE
        }
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
        const credential = await this.findOneOrFail({ id: data.id })

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

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
                this.softRemove(data)
                    .then(async () => {
                        if (data.type === credentialType.VIKEY) minusResource(resourceKeys.VIRTUAL_KEYS, data.company)
                        const credential_data: any = await this.createQueryBuilder('credential')
                            .where('id = :id', { id: data.id })
                            .withDeleted()
                            .getOne()
                        credential_data.is_delete = (new Date()).getTime()
                        await this.save(credential_data)
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
