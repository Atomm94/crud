import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Ticket } from './Ticket'
import { Admin } from './Admin'

// class CardholdersCustomDataField {

// }
// class CardholdersGroupOperations {

// }
// class CardholdersGroupAccessRights {

// }
// class VIPCardholderFunction {

// }
// class CardholderDeactivations {

// }
// class KeyStatuses {

// }
// class CardholderExtraDeactivations {

// }

@Entity('department')
export class Department extends MainEntity {
    @Column('varchar', { name: 'name', unique: true })
    name: string | null

    @Column('boolean', { name: 'status', default: true })
    status: boolean

    @OneToMany(type => Ticket, ticket => ticket.departments, { nullable: true })
    tickets: Ticket[] | null;

    @OneToMany(type => Admin, admin => admin.departments, { nullable: true })
    users: Admin[] | null;

    // public static resource: boolean = true
    // public static features = {
    //     CardholdersCustomDataField: CardholdersCustomDataField,
    //     CardholdersGroupOperations: CardholdersGroupOperations,
    //     CardholdersGroupAccessRights: CardholdersGroupAccessRights,
    //     VIPCardholderFunction: VIPCardholderFunction,
    //     CardholderDeactivations: CardholderDeactivations,
    //     KeyStatuses: KeyStatuses,
    //     CardholderExtraDeactivations: CardholderExtraDeactivations
    // }

    public static async addItem (data: Department) {
        const department = new Department()

        department.name = data.name
        department.status = data.status

        return new Promise((resolve, reject) => {
            this.save(department)
                .then((item: Department) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Department) {
        const department = await this.findOneOrFail(data.id)

        if ('name' in data) department.name = data.name
        if ('status' in data) department.status = data.status

        if (!department) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(department)
                .then((item: Department) => {
                    resolve({
                        old: department,
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
            this.findOneOrFail(itemId)
                .then((item: Department) => {
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
