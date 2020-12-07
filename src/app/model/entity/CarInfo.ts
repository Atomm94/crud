import {
    Entity,
    Column,
    OneToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { User } from './User'

@Entity('car_info')
export class CarInfo extends MainEntity {
    @Column('varchar', { name: 'model' })
    model: string

    @Column('varchar', { name: 'color', nullable: true })
    color: string | null

    @Column('int', { name: 'lp_number', nullable: true })
    lp_number: number | null

    @Column('varchar', { name: 'car_credential', nullable: true })
    car_credential: string | null

    @Column('boolean', { name: 'car_event', default: false })
    car_event: boolean

    @OneToOne(type => User, user => user.car_infos, { nullable: true })
    user: User | null;

    static gettingActions:any = false

    public static async addItem (data: CarInfo) {
        const carInfo = new CarInfo()

        carInfo.model = data.model
        carInfo.color = data.color
        carInfo.lp_number = data.lp_number
        carInfo.car_credential = data.car_credential
        carInfo.car_event = data.car_event

        return new Promise((resolve, reject) => {
            this.save(carInfo)
                .then((item: CarInfo) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: CarInfo) {
        const carInfo = await this.findOneOrFail(data.id)

        if ('model' in data) carInfo.model = data.model
        if ('color' in data) carInfo.color = data.color
        if ('lp_number' in data) carInfo.lp_number = data.lp_number
        if ('car_credential' in data) carInfo.car_credential = data.car_credential
        if ('car_event' in data) carInfo.car_event = data.car_event

        if (!carInfo) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(carInfo)
                .then((item: CarInfo) => {
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
