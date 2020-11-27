import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Company } from './Company'
import { Admin } from './Admin'
import * as _ from 'lodash'

@Entity('account_group')
export class AccountGroup extends MainEntity {
    @Column('varchar', { name: 'name' })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @Column('int', { name: 'company', nullable: false })
    company: number

    @ManyToOne(type => Company, company => company.account_group)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @OneToMany(type => Admin, users => users.account_groups)
    users: Admin[];

    public static async addItem (data: AccountGroup) {
        const accountGroup = new AccountGroup()

        accountGroup.name = data.name
        accountGroup.description = data.description
        accountGroup.parent_id = data.parent_id
        accountGroup.company = data.company

        return new Promise((resolve, reject) => {
            this.save(accountGroup)
                .then((item: AccountGroup) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccountGroup) {
        const accountGroup = await this.findOneOrFail(data.id)

        if ('name' in data) accountGroup.name = data.name
        if ('description' in data) accountGroup.description = data.description
        if ('parent_id' in data) accountGroup.parent_id = data.parent_id
        if ('company' in data) accountGroup.company = data.company

        if (!accountGroup) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accountGroup)
                .then((item: AccountGroup) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getItem (id: number, relations?: Array<string>) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: { id: itemId },
                relations: relations || []
            })
                .then((item: AccountGroup) => {
                    if (item.users) {
                        item.users.forEach((user: Admin) => {
                            const account_params: any = _.omit(user, ['password', 'super', 'verify_token'])
                            user = account_params
                        })
                    }
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
                .then((items: Array<AccountGroup>) => {
                    items.forEach((item: AccountGroup) => {
                        if (item.users) {
                            item.users.forEach((user: Admin, i: number) => {
                                const account_params: any = _.omit(user, ['password', 'super', 'verify_token'])
                                item.users[i] = account_params
                            })
                        }
                    })
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async getGroupByAccounts (id: number) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                const data = await Admin.createQueryBuilder('admin')
                    .innerJoinAndSelect('admin.account_groups', 'account_group')
                    .select('account_group.*')
                    .addSelect('COUNT(admin.id)', 'count')
                    .where(`account_group.parent_id = ${id}`)
                    .groupBy('admin.account_group')
                    .getRawMany()
                resolve(data)
            } catch (error) {
                reject(error)
            }
        })
    }
}
