import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    OneToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Packet } from './Packet'
import { Admin } from './Admin'
import { Role } from './Role'
import { PacketType } from './PacketType'
import { statusCompany } from '../../enums/statusCompany.enum'
import { CompanyDocuments } from './CompanyDocuments'
import { pick } from 'lodash'

@Entity('company')
export class Company extends MainEntity {
    @Column('varchar', { name: 'company_name' })
    company_name: string

    @Column('int', { name: 'packet', nullable: true })
    packet: number | null

    @Column('int', { name: 'packet_type', nullable: false })
    packet_type: number

    @Column('varchar', { name: 'message', nullable: true })
    message: string | null

    @Column('int', { name: 'account', nullable: true })
    account: number | null

    @Column('varchar', { name: 'status', default: statusCompany.PENDING })
    status: statusCompany

    @ManyToOne(type => Packet, packet => packet.id, { nullable: true })
    @JoinColumn({ name: 'packet' })
    packets: Packet | null;

    @ManyToOne(type => PacketType, packetType => packetType.companies, { nullable: true })
    @JoinColumn({ name: 'packet_type' })
    packet_types: PacketType | null;

    @OneToMany(type => CompanyDocuments, company_documents => company_documents.companies)
    company_documents: CompanyDocuments[];

    @OneToMany(type => Admin, users => users.companies) // specify inverse side as a second parameter
    users: Admin[];

    @OneToMany(type => Role, role => role.companies) // specify inverse side as a second parameter
    roles: Role[];

    @OneToOne(() => Admin, admin => admin.account_company, { nullable: true }) // specify inverse side as a second parameter
    @JoinColumn({ name: 'account' })
    company_account: Admin | null;

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

    public static async updateItem (data: Company) {
        const company = await this.findOneOrFail(data.id)

        if ('company_name' in data) company.company_name = data.company_name
        if ('packet' in data) company.packet = data.packet
        if ('packet_type' in data) company.packet_type = data.packet_type
        if ('message' in data) company.message = data.message
        if ('status' in data) company.status = data.status

        if (!company) return { status: 400, messsage: 'Item not found' }
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

    public static async getItem (id: number, relations?: any) {
        const itemId: number = id
        return new Promise((resolve, reject) => {
            this.findOneOrFail({
                where: { id: itemId },
                relations: relations || []
            })
                .then((item: Company) => {
                    if (item.company_account) {
                        const account_params: any = pick(item.company_account, 'id', 'first_name', 'last_name', 'company', 'phone_1', 'post_code')
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
                .then((items: Array<Company>) => {
                    items.forEach((item: Company) => {
                        if (item.company_account) {
                            const account_params: any = pick(item.company_account, 'id', 'first_name', 'last_name', 'company', 'phone_1', 'post_code')
                            item.company_account = account_params
                        }
                    })
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
