import {
    Entity,
    Column
} from 'typeorm'

import { MainEntity } from './MainEntity'

@Entity('testmodule_1')
export class Testmodule1 extends MainEntity {
    @Column('varchar', { name: 'first_name' })
    first_name: string

    @Column('int', { name: 'gender' })
    gender: number

    @Column('json', { name: 'body', nullable: true })
    body: JSON | null

    public static async addItem (data: Testmodule1) {
        const testmodule1 = new Testmodule1()

        testmodule1.first_name = data.first_name
        testmodule1.gender = data.gender
        testmodule1.body = data.body

        return new Promise((resolve, reject) => {
            this.save(testmodule1)
                .then((item: Testmodule1) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Testmodule1) {
        const testmodule1 = await this.findOneOrFail(data.id)

        if ('first_name' in data) testmodule1.first_name = data.first_name
        if ('gender' in data) testmodule1.gender = data.gender
        if ('body' in data) testmodule1.body = data.body

        if (!testmodule1) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(testmodule1)
                .then((item: Testmodule1) => {
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
                .then((item: Testmodule1) => {
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
