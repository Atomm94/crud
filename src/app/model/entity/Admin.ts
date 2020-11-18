import {
  Column,
  Entity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  createQueryBuilder,
  OneToMany
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
  Company
} from './index'
import * as bcrypt from 'bcrypt'
import { MainEntity } from './MainEntity'
import { fileSave } from '../../functions/file'
import fs from 'fs'
import { join } from 'path'
import { IAdmins } from '../../Interfaces/Admins'
import { logger } from '../../../../modules/winston/logger'

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

  @Column('longtext', {
    name: 'avatar',
    nullable: true
  })
  avatar: IAdmins[] | null;

  @Column('varchar', { name: 'password', nullable: true, length: 255 })
  password: string;

  @Column('int', { name: 'role', nullable: true })
  role: number | null;

  @Column('int', { name: 'department', nullable: true })
  department: number | null;

  @Column('boolean', { name: 'status', default: true })
  status: boolean | true;

  @Column('boolean', { name: 'super', default: false })
  super: boolean;

  @Column('timestamp', { name: 'last_login_date', nullable: true })
  last_login_date: string | null;

  @Column('varchar', { name: 'first_name', nullable: false })
  first_name: string;

  @Column('varchar', { name: 'last_name', nullable: false })
  last_name: string;

  @Column('varchar', { name: 'verify_token', nullable: true })
  verify_token: string | null;

  @Column('varchar', { name: 'phone_1', nullable: false })
  phone_1: string;

  @Column('varchar', { name: 'phone_2', nullable: true })
  phone_2: string | null;

  @Column('varchar', { name: 'post_code', nullable: false })
  post_code: string;

  @Column('varchar', { name: 'country', nullable: true })
  country: string | null;

  @Column('varchar', { name: 'site', nullable: true })
  site: string | null;

  @Column('varchar', { name: 'address', nullable: true })
  address: string | null;

  @Column('varchar', { name: 'viber', nullable: true })
  viber: string | null;

  @Column('varchar', { name: 'whatsapp', nullable: true })
  whatsapp: string | null;

  @Column('int', { name: 'company', nullable: true })
  company: number | null;

  @ManyToOne(type => Department, department => department.users, { nullable: true })
  @JoinColumn({ name: 'department' })
  departments: Department | null;

  @ManyToOne(type => Role, role => role.admins, { nullable: true })
  @JoinColumn({ name: 'role' })
  roles: Role | null;

  @OneToMany(type => Ticket, ticket => ticket.user)
  tickets: Admin[];

  @OneToMany(type => TicketMessage, ticket_message => ticket_message.users)
  ticket_messages: TicketMessage[];

  @ManyToOne(type => Company, company => company.users, { nullable: true })
  @JoinColumn({ name: 'company' })
  companies: Company | null;

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

  public static async addItem (data: any, user: any) {
      const admin = new Admin()

      admin.username = data.username
      admin.email = data.email
      admin.password = data.password
      admin.status = (data.status === 'true') ? true : (data.status === 'false') ? false : data.status
      if ('role' in data) admin.role = data.role
      if ('department' in data) admin.department = data.department
      if ('avatar' in data) admin.avatar = data.avatar
      // if (file) admin.avatar = newFilePath

      admin.first_name = data.first_name
      admin.last_name = data.last_name
      if ('verify_token' in data) admin.verify_token = data.verify_token
      admin.phone_1 = data.phone_1
      if ('phone_2' in data) admin.phone_2 = data.phone_2
      admin.post_code = data.post_code
      if ('country' in data) admin.country = data.country
      if ('site' in data) admin.site = data.site
      if ('address' in data) admin.address = data.address
      if ('viber' in data) admin.viber = data.viber
      if ('whatsapp' in data) admin.whatsapp = data.whatsapp
      if ('company' in data) admin.company = data.company

      return new Promise(async (resolve, reject) => {
        if (!user.company || await this.canCreate(user.company, this.name)) {
        this.save(admin)
          .then((item: Admin) => {
            resolve(item)
          })
          .catch((error: any) => {
            reject(error)
          })
        } else {
          reject(Error(`Resource ${this.name} is limited for company ${user.company}!!`))
        }
      })
  }

  public static async updateItem (data: any) {
    const admin = await this.findOneOrFail(data.id)

    if ('username' in data) admin.username = data.username
    if ('email' in data) admin.email = data.email
    if ('status' in data) admin.status = (data.status === 'true') ? true : (data.status === 'false') ? false : data.status
    if ('role' in data) admin.role = data.role
    if ('department' in data) admin.department = data.department
    if ('avatar' in data) admin.avatar = data.avatar

    if (!admin) return { status: 400, messsage: 'Item not found' }
    return new Promise((resolve, reject) => {
      this.save(admin)
        .then((item: Admin) => {
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
        .then((item: Admin) => {
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
