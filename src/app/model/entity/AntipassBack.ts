import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'
import { typeAntipassBack } from '../../enums/typeAntipassBack.enum'
import { timeTypeAntipassBack } from '../../enums/timeTypeAntipassBack.enum'
import { MainEntityColumns } from './MainEntityColumns'
import { AccessPointZone } from '.'

@Entity('antipass_back')
export class AntipassBack extends MainEntityColumns {
    @Column('enum', { name: 'type', enum: typeAntipassBack, default: typeAntipassBack.DISABLE })
    type: typeAntipassBack

    @Column('boolean', { name: 'enable_timer', default: false })
    enable_timer: boolean

    @Column('int', { name: 'time', nullable: true })
    time: number | null

    @Column('enum', { name: 'time_type', enum: timeTypeAntipassBack, default: timeTypeAntipassBack.MINUTES })
    time_type: timeTypeAntipassBack

    // @OneToMany(type => CardholderGroup, cardholder_group => cardholder_group.antipass_backs)
    // cardholder_groups: CardholderGroup[];

    // @OneToMany(type => Cardholder, cardholder => cardholder.antipass_backs)
    // cardholders: Cardholder[];

    @OneToMany(type => AccessPointZone, access_point_zone => access_point_zone.antipass_backs)
    access_point_zones: AccessPointZone[];

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async addItem (data: AntipassBack): Promise<AntipassBack> {
        const antipassBack = new AntipassBack()

        antipassBack.type = data.type
        antipassBack.enable_timer = data.enable_timer
        antipassBack.time = data.time
        antipassBack.time_type = data.time_type

        return new Promise((resolve, reject) => {
            this.save(antipassBack, { transaction: false })
                .then((item: AntipassBack) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AntipassBack): Promise<{ [key: string]: any }> {
        const antipassBack = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, antipassBack)

        if ('type' in data) antipassBack.type = data.type
        if ('enable_timer' in data) antipassBack.enable_timer = data.enable_timer
        if ('time' in data) antipassBack.time = data.time
        if ('time_type' in data) antipassBack.time_type = data.time_type

        if (!antipassBack) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(antipassBack, { transaction: false })
                .then((item: AntipassBack) => {
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

    public static async getItem (id: number) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({ where: { id: itemId } })
                .then((item: AntipassBack) => {
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
