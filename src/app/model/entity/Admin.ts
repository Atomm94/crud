import {
  Column,
  Entity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  createQueryBuilder,
  OneToMany,
  OneToOne
  // ManyToOne
  // Index,
  // CreateDateColumn,
  // UpdateDateColumn,
  // ObjectIdColumn,
  // ObjectID
  // PrimaryGeneratedColumn,
} from 'typeorm'
import {
  Role,
  TicketMessage,
  Department,
  Ticket,
  AccountGroup,
  MainEntity,
  Company
} from './index'
import * as bcrypt from 'bcrypt'
import { fileSave } from '../../functions/file'
import fs from 'fs'
import { join } from 'path'
import { IAdmins } from '../../Interfaces/Admins'
import { logger } from '../../../../modules/winston/logger'
import { StandardReport } from './StandardReport'
import { Cardholder } from './Cardholder'
import { adminStatus } from '../../enums/adminStatus.enum'

const parentDir = join(__dirname, '../../..')

@Entity('admin')
export class Admin extends MainEntity {
  @Column('varchar', { name: 'username', nullable: true, length: 255, unique: true })
  username: string | null;

  @Column('varchar', {
    name: 'email',
    unique: true,
    length: 255
  })
  email: string;

  @Column('longtext', { name: 'avatar', nullable: true })
  avatar: IAdmins[] | null;

  @Column('varchar', { name: 'password', nullable: true, length: 255 })
  password: string;

  @Column('int', { name: 'role', nullable: true })
  role: number | null;

  @Column('int', { name: 'department', nullable: true })
  department: number | null;

  @Column('enum', { name: 'status', enum: adminStatus, default: adminStatus.ACTIVE })
  status: adminStatus

  @Column('boolean', { name: 'super', default: false })
  super: boolean;

  @Column('timestamp', { name: 'last_login_date', nullable: true })
  last_login_date: string | null;

  @Column('varchar', { name: 'first_name', nullable: false })
  first_name: string;

  @Column('varchar', { name: 'last_name', nullable: true })
  last_name: string;

  @Column('varchar', { name: 'verify_token', nullable: true })
  verify_token: string | null;

  @Column('varchar', { name: 'phone_1', nullable: true })
  phone_1: string;

  @Column('varchar', { name: 'phone_2', nullable: true })
  phone_2: string | null;

  @Column('varchar', { name: 'post_code', nullable: true })
  post_code: string;

  @Column('varchar', { name: 'country', nullable: true })
  country: string | null;

  @Column('varchar', { name: 'city', nullable: true })
  city: string | null;

  @Column('varchar', { name: 'site', nullable: true })
  site: string | null;

  @Column('varchar', { name: 'address', nullable: true })
  address: string | null;

  @Column('boolean', { name: 'viber', default: false })
  viber: boolean;

  @Column('boolean', { name: 'whatsapp', default: false })
  whatsapp: boolean;

  @Column('boolean', { name: 'telegram', default: false })
  telegram: boolean;

  @Column('int', { name: 'cardholder', nullable: true })
  cardholder: number | null

  @Column('int', { name: 'company', nullable: true })
  company: number | null;

  @Column('longtext', { name: 'comment', nullable: true })
  comment: string | null;

  @Column('int', { name: 'account_group', nullable: true })
  account_group: number | null;

  @Column('boolean', { name: 'role_inherited', default: false })
  role_inherited: boolean;

  @Column('varchar', { name: 'date_format', nullable: true })
  date_format: string | null;

  @Column('varchar', { name: 'time_format', nullable: true })
  time_format: string | null;

  @Column('varchar', { name: 'time_zone', nullable: true })
  time_zone: string | null;

  @Column('longtext', { name: 'settings', nullable: true })
  settings: string | null;

  @ManyToOne(type => Department, department => department.users, { nullable: true })
  @JoinColumn({ name: 'department' })
  departments: Department | null;

  @ManyToOne(type => Role, role => role.admins, { nullable: true })
  @JoinColumn({ name: 'role' })
  roles: Role | null;

  @OneToMany(type => Ticket, ticket => ticket.user, { cascade: true })
  tickets: Admin[];

  @OneToMany(type => TicketMessage, ticket_message => ticket_message.users)
  ticket_messages: TicketMessage[];

  @ManyToOne(type => Company, company => company.users, { nullable: true })
  @JoinColumn({ name: 'company' })
  companies: Company | null;

  @OneToOne(type => Company, company => company.company_account, { nullable: true })
  account_company: Company | null;

  @ManyToOne(type => AccountGroup, account_group => account_group.users)
  @JoinColumn({ name: 'account_group' })
  account_groups: AccountGroup | null;

  @OneToMany(type => StandardReport, report => report.authors)
  reports: StandardReport[];

  @OneToOne(type => Cardholder, cardholder => cardholder.admins, { nullable: true })
  @JoinColumn({ name: 'cardholder' })
  cardholders: Cardholder | null;

  @BeforeInsert()
  async generatePassword () {
    if (this.password) {
      const password = bcrypt.hashSync(this.password, 10)
      this.password = password
    }
  }

  @BeforeUpdate()
  async updatePassword () {
    if (this.password) {
      const password = bcrypt.hashSync(this.password, 10)
      this.password = password
    }
  }

  public static resource: boolean = true
  public static serviceResource: boolean = true

  public static async addItem (data: any, user: any = null): Promise<Admin> {
    const admin = new Admin()

    admin.username = data.username
    admin.email = data.email
    if ('password' in data) admin.password = data.password
    if ('role' in data) admin.role = data.role
    if ('status' in data) admin.status = data.status
    if ('department' in data) admin.department = data.department
    if ('avatar' in data) admin.avatar = data.avatar
    // if (file) admin.avatar = newFilePath

    // admin.first_name = data.first_name
    // admin.last_name = data.last_name
    if ('first_name' in data) admin.first_name = data.first_name
    if ('last_name' in data) admin.last_name = data.last_name
    if ('verify_token' in data) admin.verify_token = data.verify_token
    // admin.phone_1 = data.phone_1
    if ('phone_1' in data) admin.phone_1 = data.phone_1
    if ('phone_2' in data) admin.phone_2 = data.phone_2
    if ('post_code' in data) admin.post_code = data.post_code
    if ('country' in data) admin.country = data.country
    if ('city' in data) admin.city = data.city
    if ('site' in data) admin.site = data.site
    if ('address' in data) admin.address = data.address
    if ('viber' in data) admin.viber = data.viber
    if ('whatsapp' in data) admin.whatsapp = data.whatsapp
    if ('telegram' in data) admin.telegram = data.telegram
    if ('comment' in data) admin.comment = data.comment
    if ('account_group' in data) admin.account_group = data.account_group
    if ('role_inherited' in data) admin.role_inherited = data.role_inherited
    if ('cardholder' in data) admin.cardholder = data.cardholder
    if ('date_format' in data) admin.date_format = data.date_format
    if ('time_format' in data) admin.time_format = data.time_format
    if ('time_zone' in data) admin.time_zone = data.time_zone

    if ('company' in data) {
      admin.company = data.company
    } else {
      admin.company = (user && user.company) ? user.company : null
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // if (!user || !user.company) {
      this.save(admin)
        .then((item: Admin) => {
          resolve(item)
        })
        .catch((error: any) => {
          reject(error)
        })
      // } else {
      // reject(Error(`Resource ${this.name} is limited for company ${user.company}!!`))
      // }
    })
  }

  public static async updateItem (data: any): Promise<{ [key: string]: any }> {
    const admin = await this.findOneOrFail({ id: data.id })
    const oldData = Object.assign({}, admin)
    delete admin.password

    if ('username' in data) admin.username = data.username
    if ('first_name' in data) admin.first_name = data.first_name
    if ('last_name' in data) admin.last_name = data.last_name
    if ('address' in data) admin.address = data.address
    if ('country' in data) admin.country = data.country
    if ('city' in data) admin.city = data.city
    if ('phone_1' in data) admin.phone_1 = data.phone_1
    if ('phone_2' in data) admin.phone_2 = data.phone_2
    if ('post_code' in data) admin.post_code = data.post_code
    if ('viber' in data) admin.viber = data.viber
    if ('whatsapp' in data) admin.whatsapp = data.whatsapp
    if ('telegram' in data) admin.telegram = data.telegram
    if ('email' in data) admin.email = data.email
    if ('role' in data) admin.role = data.role
    if ('status' in data) admin.status = data.status
    if ('department' in data) admin.department = data.department
    if ('comment' in data) admin.comment = data.comment
    if ('avatar' in data) admin.avatar = data.avatar
    if ('site' in data) admin.site = data.site
    if ('account_group' in data) admin.account_group = data.account_group
    if ('role_inherited' in data) admin.role_inherited = data.role_inherited
    if ('post_code' in data) admin.post_code = data.post_code
    if ('date_format' in data) admin.date_format = data.date_format
    if ('time_format' in data) admin.time_format = data.time_format
    if ('time_zone' in data) admin.time_zone = data.time_zone

    if (!admin) return { status: 400, message: 'Item not found' }
    return new Promise((resolve, reject) => {
      this.save(admin)
        .then((item: Admin) => {
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
        .then((item: Admin) => {
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
      const reports = await StandardReport.find({ where: { author: data.id, company: data.company } })
      reports.map(async (item) => await StandardReport.destroyItem(item))

      this.findOneOrFail({ id: data.id, company: data.company }).then((data: any) => {
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
    // console.log(await this.getRolesAndAttributes(9))

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

  public static async saveImage (file: any) {
    return fileSave(file)
  }

  public static async deleteImage (file: any) {
    return fs.unlink(`${parentDir}/public/${file}`, (err) => {
      if (err) throw err
      logger.info('Delete complete!')
    })
  }

  public static async getRolesAndAttributes (id: number) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const admin: any = await createQueryBuilder(Admin, 'admin').innerJoinAndSelect(Role, 'role', 'role.id = admin.role').select('role.permissions').where('admin.id = :id', { id: id }).getRawOne()
      if (admin) {
        resolve(admin)
      }
    })
  }
}
