import {
  Column,
  Entity,
  OneToMany
  // ManyToOne,
  // OneToMany
  // Index,
  // CreateDateColumn,
  // UpdateDateColumn,
  // ObjectIdColumn,
  // ObjectID
  // PrimaryGeneratedColumn,
} from 'typeorm'
import { MainEntity } from './MainEntity'
import { Admin } from './index'
@Entity('role')
export class Role extends MainEntity {
  @Column('varchar', { name: 'slug', nullable: true, length: 255 })
  slug: string | null;

  @Column('json', { name: 'permissions', nullable: true })
  permissions: { [key: string]: string[] } | null;

  @OneToMany(type => Admin, admin => admin.roles, { nullable: true })
  admins: Admin[] | null;

  @Column('boolean', { name: 'status', default: true })
  status: boolean | true;

  public static async addItem (data: Role) {
    const role = new Role()

    role.slug = data.slug
    role.permissions = data.permissions
    role.status = data.status

    return new Promise((resolve, reject) => {
      this.save(role)
        .then((item: Role) => {
          resolve(item)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  public static async updateItem (data: Role) {
    const role = await this.findOneOrFail(data.id)

    if ('slug' in data) role.slug = data.slug
    if ('permissions' in data) role.permissions = data.permissions
    if ('status' in data) role.status = data.status

    if (!role) return { status: 400, messsage: 'Item not found' }
    return new Promise((resolve, reject) => {
      this.save(role)
        .then((item: Role) => {
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
        .then((item: Role) => {
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
        .then((items) => {
          resolve(items)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }
}
