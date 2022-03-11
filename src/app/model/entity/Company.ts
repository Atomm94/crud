import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    OneToOne,
    DeleteDateColumn
} from 'typeorm'
import * as _ from 'lodash'

import { statusCompany } from '../../enums/statusCompany.enum'
import {
    AccessRight,
    MainEntity,
    Package,
    Admin,
    Role,
    PackageType,
    CompanyDocuments,
    AccountGroup,
    Schedule,
    AccessPoint,
    AccessRule,
    CompanyResources
} from './index'

import { minusResource } from '../../functions/minusResource'
import { Acu } from './Acu'
import { AcuStatus } from './AcuStatus'
@Entity('company')
export class Company extends MainEntity {
    @Column('varchar', { name: 'company_name', nullable: false })
    company_name: string

    @Column('int', { name: 'package', nullable: true })
    package: number | null

    @Column('int', { name: 'package_type', nullable: false })
    package_type: number

    @Column('longtext', { name: 'message', nullable: true })
    message: string | null

    @Column('int', { name: 'account', nullable: true })
    account: number | null

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null

    @Column('int', { name: 'partition_parent_id', nullable: true })
    partition_parent_id: number | null

    @Column('enum', { name: 'status', enum: statusCompany, default: statusCompany.PENDING })
    status: statusCompany

    @DeleteDateColumn({ type: 'timestamp', name: 'delete_date' })
    public deleteDate: Date

    @ManyToOne(type => Package, package_data => package_data.id, { nullable: true })
    @JoinColumn({ name: 'package' })
    packages: Package | null;

    @ManyToOne(type => PackageType, packageType => packageType.companies, { nullable: true })
    @JoinColumn({ name: 'package_type' })
    package_types: PackageType | null;

    @OneToMany(type => CompanyDocuments, company_documents => company_documents.companies)
    company_documents: CompanyDocuments[];

    @OneToOne(type => CompanyResources, company_resource => company_resource.companies)
    company_resources: CompanyResources;

    @OneToMany(type => Admin, users => users.companies)
    users: Admin[];

    @OneToMany(type => Role, role => role.companies)
    roles: Role[];

    @OneToOne(() => Admin, admin => admin.account_company, { nullable: true })
    @JoinColumn({ name: 'account' })
    company_account: Admin | null;

    @OneToMany(type => AccountGroup, account_group => account_group.companies)
    account_groups: AccountGroup[];

    @OneToMany(type => Schedule, schedule => schedule.companies)
    schedules: Schedule[];

    @OneToMany(type => AccessPoint, access_point => access_point.companies)
    access_points: AccessPoint[];

    @OneToMany(type => AccessRule, access_rule => access_rule.companies)
    access_rules: AccessRule[];

    @OneToMany(type => AccessRight, access_right => access_right.companies)
    access_rights: AccessRight[];

    @OneToMany(type => Acu, acu => acu.companies)
    acus: Acu[];

    @OneToMany(type => AcuStatus, acu_status => acu_status.companies)
    acu_statuses: AcuStatus[];

    public static resource: boolean = true

    public static async addItem (data: Company): Promise<Company> {
        const company = new Company()

        company.company_name = data.company_name
        if ('package' in data) company.package = data.package
        company.package_type = data.package_type
        if ('message' in data) company.message = data.message
        if ('parent_id' in data) company.parent_id = data.parent_id
        if ('partition_parent_id' in data) company.partition_parent_id = data.partition_parent_id

        // company.status = data.status

        return new Promise((resolve, reject) => {
            this.save(company)
                .then((item: Company) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: Company, user?: any): Promise<{ [key: string]: any }> {
        const where: any = { id: data.id }
        if (user && user.company && data.id !== user.company) where.parent_id = user.company
        const company = await this.findOneOrFail(where)
        const oldData = Object.assign({}, company)

        if ('company_name' in data) company.company_name = data.company_name
        if ('package' in data) company.package = data.package
        if ('package_type' in data) company.package_type = data.package_type
        if ('message' in data) company.message = data.message
        if ('status' in data) company.status = data.status

        if (!company) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            if ('status' in data && data.status === statusCompany.ENABLE && !company.package) {
                reject(new Error(`Cant change status of Company to ${statusCompany.ENABLE} without select Package`))
            } else {
                this.save(company)
                    .then((item: Company) => {
                        resolve({
                            old: oldData,
                            new: item
                        })
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            }
        })
    }

    public static async getItem (id: number, relations?: Array<string>): Promise<Company> {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: { id: itemId },
                relations: relations || []
            })
                .then((item: Company) => {
                    if (item.company_account) {
                        const account_params: any = _.omit(item.company_account, ['password', 'super', 'verify_token'])
                        item.company_account = account_params
                    }
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async destroyItem (where: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.findOneOrFail(where).then((data: any) => {
                this.softRemove(data)
                    .then(() => {
                        if (data.parent_id) {
                            minusResource(data.package_type, data.parent_id)
                        }
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
                .then((items: Array<Company> | { data: Array<Company>, count: number }) => {
                    const data = (Array.isArray(items)) ? items : items.data
                    data.forEach((item: Company) => {
                        if (item.company_account) {
                            const account_params: any = _.omit(item.company_account, ['password', 'super', 'verify_token'])
                            item.company_account = account_params
                        }
                    })
                    if (Array.isArray(items)) {
                        items = data
                    } else {
                        items.data = data
                    }
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
