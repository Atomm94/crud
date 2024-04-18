import {
    Entity,
    Column,
    OneToOne
} from 'typeorm'

import { Cardholder, MainEntityColumns } from './index'

@Entity('car_info')
export class CarInfo extends MainEntityColumns {
    @Column('varchar', { name: 'model', nullable: true })
    model: string

    @Column('varchar', { name: 'color', nullable: true })
    color: string | null

    @Column('varchar', { name: 'lp_number', nullable: true })
    lp_number: string | null

    @Column('varchar', { name: 'car_credential', nullable: true })
    car_credential: string | null

    @Column('boolean', { name: 'car_event', default: false })
    car_event: boolean

    @Column('longtext', { name: 'avatar', nullable: true })
    avatar: string | null

    @OneToOne(type => Cardholder, user => user.car_infos, { nullable: true })
    cardholders: Cardholder | null;

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: CarInfo): Promise<CarInfo> {
        const carInfo = new CarInfo()

        carInfo.model = data.model
        carInfo.color = data.color
        carInfo.lp_number = data.lp_number
        carInfo.car_credential = data.car_credential
        carInfo.car_event = data.car_event
        if ('avatar' in data) {
            carInfo.avatar = (data.avatar && typeof data.avatar === 'object') ? JSON.stringify(data.avatar) : data.avatar
        }

        return new Promise((resolve, reject) => {
            this.save(carInfo, { transaction: false })
                .then((item: CarInfo) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CarInfo): Promise<{ [key: string]: any }> {
        const carInfo = await this.findOneOrFail({ where: { id: data.id } })

        if ('model' in data) carInfo.model = data.model
        if ('color' in data) carInfo.color = data.color
        if ('lp_number' in data) carInfo.lp_number = data.lp_number
        if ('car_credential' in data) carInfo.car_credential = data.car_credential
        if ('car_event' in data) carInfo.car_event = data.car_event
        if ('avatar' in data) {
            carInfo.avatar = (data.avatar && typeof data.avatar === 'object') ? JSON.stringify(data.avatar) : data.avatar
        }

        if (!carInfo) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(carInfo, { transaction: false })
                .then((item: CarInfo) => {
                    resolve({
                        old: carInfo,
                        new: item
                    })
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({ where: { id: itemId } })
                .then((item: CarInfo) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (id: number) {
        const itemId: number = id
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.remove(await this.findOneOrFail({ where: { id: itemId } }))
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
