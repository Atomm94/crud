import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { ISliders } from '../../Interfaces/Sliders'

@Entity('slider')
export class Slider extends MainEntity {
    @Column('longtext', { name: 'title', nullable: true })
    title: ISliders[] | null;

    @Column('longtext', { name: 'description', nullable: true })
    description: ISliders[] | null;

    @Column('longtext', { name: 'photo', nullable: true })
    photo: ISliders[] | null;

    @Column('longtext', { name: 'url', nullable: true })
    url: ISliders[] | null;

    @Column('boolean', { name: 'status', default: true })
    status: boolean | true;

    public static async addItem (data: any) {
        const slider = new Slider()

        slider.title = data.title
        slider.url = data.url
        slider.description = data.description
        slider.photo = data.photo
        slider.status = data.status === 'false' ? false : data.status === 'true' ? true : data.status

        return new Promise((resolve, reject) => {
            this.save(slider)
                .then((item: Slider) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any) {
        const slider = await this.findOneOrFail(data.id)

        if ('title' in data) slider.title = data.title
        if ('url' in data) slider.url = data.url
        if ('description' in data) slider.description = data.description
        if ('status' in data) slider.status = data.status === 'false' ? false : data.status === 'true' ? true : data.status
        if ('photo' in data) slider.photo = data.photo ? data.photo : null

        if (!slider) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(slider)
                .then((item: Slider) => {
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
                .then((item: Slider) => {
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
}
