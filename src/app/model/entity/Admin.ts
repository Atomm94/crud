import {
  Column,
  Entity,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  createQueryBuilder
  // ManyToOne
  // Index,
  // CreateDateColumn,
  // UpdateDateColumn,
  // ObjectIdColumn,
  // ObjectID
  // PrimaryGeneratedColumn,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { MainEntity } from './MainEntity'
import { Role } from './index'
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

  @Column('varchar', { name: 'full_name', nullable: true, length: 255 })
  full_name: string | null;

  @Column('varchar', {
    name: 'email',
    unique: true,
    length: 255
  })
  email: string;

  @Column('jsonb', {
    name: 'avatar',
    nullable: true
  })
  avatar: IAdmins[] | null;

  @Column('varchar', { name: 'password', nullable: true, length: 255 })
  password: string;

  @Column('int', { name: 'role', nullable: true })
  role: number | null;

  @Column('boolean', { name: 'status', default: true })
  status: boolean | true;

  @Column('timestamp', { name: 'last_login_date', nullable: true })
  last_login_date: string;

  @ManyToOne(type => Role, role => role.admins)
  @JoinColumn({ name: 'role' })
  roles: Role;

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

  public static async addItem (data: any) {
    const admin = new Admin()

    admin.username = data.username
    admin.email = data.email
    admin.password = data.password
    admin.full_name = data.full_name
    admin.status = (data.status === 'true') ? true : (data.status === 'false') ? false : data.status
    admin.role = +data.role
    admin.avatar = data.avatar
    // if (file) admin.avatar = newFilePath

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

  public static async updateItem (data: any) {
    const admin = await this.findOneOrFail(data.id)

    if ('username' in data) admin.username = data.username
    if ('full_name' in data) admin.full_name = data.full_name
    if ('email' in data) admin.email = data.email
    if ('status' in data) admin.status = (data.status === 'true') ? true : (data.status === 'false') ? false : data.status
    if ('role' in data) admin.role = +data.role
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

  public static async getItem (id: number) {
    const itemId: number = id
    return new Promise((resolve, reject) => {
      this.findOneOrFail(itemId)
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
