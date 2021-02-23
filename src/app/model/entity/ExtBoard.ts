import {
    Entity,
    Column,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { ExtDevice } from './ExtDevice'

@Entity('ext_board')
export class ExtBoard extends MainEntity {
    @Column('varchar', { name: 'name', nullable: false })
    name: string

    @Column('int', { name: 'input', nullable: false })
    input: number

    @Column('int', { name: 'output', nullable: false })
    output: number

    @OneToMany(type => ExtDevice, ext_device => ext_device.ext_boards)
    ext_devices : ExtDevice[];

    public static gettingActions: boolean = false
    public static gettingAttributes: boolean = false

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
                relations: relations || []
            })
                .then((item: ExtBoard) => {
                    resolve(item)
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
