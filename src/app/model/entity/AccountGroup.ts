import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm'

import { Role, Admin, Company, MainEntity } from './index'
import * as _ from 'lodash'

@Entity('account_group')
export class AccountGroup extends MainEntity {
    @Column('varchar', { name: 'name' })
    name: string

    @Column('varchar', { name: 'description', nullable: true })
    description: string | null

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @Column('int', { name: 'role', nullable: true })
    role: number

    @Column('int', { name: 'company', nullable: false })
    company: number

    @Column('boolean', { name: 'role_inherited', default: false })
    role_inherited: boolean;

    @ManyToOne(type => Company, company => company.account_groups)
    @JoinColumn({ name: 'company' })
    companies: Company;

    @ManyToOne(type => Role, role => role.account_groups, { nullable: true })
    @JoinColumn({ name: 'role' })
    roles: Role | null;

    @OneToMany(type => Admin, users => users.account_groups)
    users: Admin[];

    public static resource: boolean = true
    public static serviceResource: boolean = true

    public static async addItem (data: AccountGroup) {
        const accountGroup = new AccountGroup()

        accountGroup.name = data.name
        accountGroup.company = data.company
        if ('description' in data) accountGroup.description = data.description
        if ('parent_id' in data) accountGroup.parent_id = data.parent_id
        if ('role' in data) accountGroup.role = data.role
        return new Promise((resolve, reject) => {
            this.save(accountGroup, { transaction: false })
                .then((item: AccountGroup) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: AccountGroup): Promise<{ [key: string]: any }> {
        const accountGroup = await this.findOneOrFail({ where: { id: data.id } })
        const oldData = Object.assign({}, accountGroup)

        if ('name' in data) accountGroup.name = data.name
        if ('description' in data) accountGroup.description = data.description
        if ('parent_id' in data) accountGroup.parent_id = data.parent_id
        if ('role' in data) accountGroup.role = data.role

        if (!accountGroup) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(accountGroup, { transaction: false })
                .then((item: AccountGroup) => {
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

    public static async getItem (where: any, relations?: Array<string>) {
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: where,
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

    public static async destroyItem (data: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail({ where: { id: data.id, company: data.company } }).then((data: any) => {
                this.remove(data)
                    .then(() => {
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

    public static async getGroupByAccounts (id: number, company: number | null) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                const data = await Admin.createQueryBuilder('admin')
                    .innerJoinAndSelect('admin.account_groups', 'account_group')
                    .select('account_group.*')
                    .addSelect('COUNT(admin.id)', 'count')
                    .where(`account_group.parent_id = ${id}`)
                    .andWhere(`account_group.company = ${company}`)
                    .groupBy('admin.account_group')
                    .getRawMany()
                resolve(data)
            } catch (error) {
                reject(error)
            }
        })
    }
}
