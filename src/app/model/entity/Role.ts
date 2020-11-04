import {
  Column,
  Entity,
  OneToMany,
  AfterInsert,
  AfterUpdate,
  AfterRemove
  // ManyToOne,
  // OneToMany
  // Index,
  // CreateDateColumn,
  // UpdateDateColumn,
  // ObjectIdColumn,
  // ObjectID
  // PrimaryGeneratedColumn,
} from 'typeorm'
import * as Models from './index'
import { MainEntity } from './MainEntity'
import { Admin } from './index'
import { AccessControl } from '../../functions/access-control'

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

  @AfterInsert()
  async createAccessControl () {
    if (this.permissions) {
      AccessControl.addGrant(this.id, this.permissions)
    }
  }

  @AfterUpdate()
  async updateAccessControl () {
    if (this.permissions) {
      AccessControl.updateGrant(this.id, this.permissions)
    }
  }

  @AfterRemove()
  async deleteAccessControl () {
    AccessControl.deleteGrant(this.id)
  }

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

  public static async destroyItem (id: number) {
    const itemId: number = +id
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
        .then((items) => {
          resolve(items)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  public static async getRole () {
    return await Role.createQueryBuilder('role')
      .select(['role', 'admins'])
      .leftJoin('role.admins', 'admins')
      .getMany()
  }

  public static getAllAccess () {
    const models: any = Models
    const accesses: any = {}
    Object.keys(models).forEach((model: string) => {
      if (models[model].gettingActions === true) {
        accesses[model] = { actions: models[model].getActions() }
      }
      // if (models[model].gettingAttributes === true) {
      //   const attributes = models[model].getAttributes()
      //   if (accesses[model]) {
      //     accesses[model].attributes = attributes
      //   } else {
      //     accesses[model] = { attributes: attributes }
      //   }
      // }
    })
    return accesses
  }
}
