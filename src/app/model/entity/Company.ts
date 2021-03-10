import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    OneToOne
} from 'typeorm'
import * as _ from 'lodash'

import { statusCompany } from '../../enums/statusCompany.enum'
import {
    AccessRight,
    MainEntity,
    Packet,
    Admin,
    Role,
    PacketType,
    CompanyDocuments,
    AccountGroup,
    Schedule,
    AccessPoint,
    AccessRule
} from './index'

@Entity('company')
export class Company extends MainEntity {
    @Column('varchar', { name: 'company_name' })
    company_name: string

    @Column('int', { name: 'packet', nullable: true })
    packet: number | null

    @Column('int', { name: 'packet_type', nullable: false })
    packet_type: number

    @Column('longtext', { name: 'message', nullable: true })
    message: string | null

    @Column('int', { name: 'account', nullable: true })
    account: number | null

    @Column('enum', { name: 'status', enum: statusCompany, default: statusCompany.PENDING })
    status: statusCompany

    @ManyToOne(type => Packet, packet => packet.id, { nullable: true })
    @JoinColumn({ name: 'packet' })
    packets: Packet | null;

    @ManyToOne(type => PacketType, packetType => packetType.companies, { nullable: true })
    @JoinColumn({ name: 'packet_type' })
    packet_types: PacketType | null;

    @OneToMany(type => CompanyDocuments, company_documents => company_documents.companies)
    company_documents: CompanyDocuments[];

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

    public static async addItem (data: Company) {
        const company = new Company()

        company.company_name = data.company_name
        if ('packet' in data) company.packet = data.packet
        company.packet_type = data.packet_type
        if ('message' in data) company.message = data.message
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

    public static async updateItem (data: Company): Promise<{ [key: string]: any }> {
        const company = await this.findOneOrFail(data.id)
        const oldData = Object.assign({}, company)

        if ('company_name' in data) company.company_name = data.company_name
        if ('packet' in data) company.packet = data.packet
        if ('packet_type' in data) company.packet_type = data.packet_type
        if ('message' in data) company.message = data.message
        if ('status' in data) company.status = data.status

        if (!company) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
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
        })
    }

    public static async getItem (id: number, relations?: Array<string>) {
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
