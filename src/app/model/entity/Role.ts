import {
  Column,
  Entity,
  OneToMany,
  JoinColumn,
  ManyToOne,
  Index
  // AfterInsert,
  // AfterUpdate,
  // AfterRemove
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
import { Company } from './Company'
import { Admin } from './Admin'
import { AccountGroup } from './AccountGroup'

@Index('slug|company', ['slug', 'company'], { unique: true })

@Entity('role')
export class Role extends MainEntity {
  @Column('varchar', { name: 'slug', nullable: true, length: 255 })
  slug: string | null;

  @Column('longtext', { name: 'permissions', nullable: false })
  permissions: string;

  @Column('int', { name: 'company', nullable: true })
  company: number | null;

  @Column('boolean', { name: 'main', default: false })
  main: boolean | true;

  @Column('boolean', { name: 'status', default: true })
  status: boolean | true;

  @ManyToOne(type => Company, company => company.roles, { nullable: true })
  @JoinColumn({ name: 'company' })
  companies: Company | null;

  @OneToMany(type => Admin, admin => admin.roles, { nullable: true })
  admins: Admin[];

  @OneToMany(type => AccountGroup, account_group => account_group.roles, { nullable: true })
  account_groups: AccountGroup[];

  public static default_partner_role: any = {
    ServiceCompany: {
      actions: {
        getItem: true,
        updateItem: true
      }
    },
    Role: {
      actions: {
        addItem: true,
        updateItem: true,
        getItem: true,
        destroyItem: true,
        getAllItems: true,
        getRole: true,
        getAllAccess: true
      }
    },
    Product: {
      actions: {
        updateItem: true,
        getItem: true,
        destroyItem: true
      }
    },
    CompanyDocuments: {
      actions: {
        addItem: true,
        updateItem: true,
        getItem: true,
        destroyItem: true,
        saveFile: true,
        deleteFile: true
      }
    },
    Department: {
      actions: {
        getItem: true
      }
    },
    Admin: {
      actions: {
        getItem: true
      }
    },
    Ticket: {
      actions: {
        addItem: true,
        updateItem: true,
        getItem: true,
        destroyItem: true,
        getAllItems: true,
        saveImage: true,
        deleteImage: true,
        addMessage: true,
        updateMessage: true,
        getMessage: true,
        destroyMessage: true,
        getAllMessages: true,
        saveMessageImage: true,
        deleteMessageImage: true
      }
    }

  }

  public static async addItem (data: Role) {
    const role = new Role()

    role.slug = data.slug
    role.permissions = data.permissions
    role.status = data.status
    if ('main' in data) role.main = data.main
    if ('company' in data) role.company = data.company

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
    if ('main' in data) role.main = data.main

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

  public static async getItem (id: number, where?: any, relations?: Array<string>) {
    const itemId: number = id
    if (!where) where = {}
    where.id = itemId
    return new Promise((resolve, reject) => {
      this.findOneOrFail({
        where: where,
        relations: relations || []
      })
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

  // public static async getRole () {
  //   return await Role.createQueryBuilder('role')
  //     .select(['role', 'admins'])
  //     .leftJoin('role.admins', 'admins')
  //     .getMany()
  // }

  public static async getAllAccess (user: any) {
    const models: any = Models
    const accesses: any = {}
    if (user.company) {
      const role: any = await Role.findOne({ id: user.role, company: user.company })
      if (role) {
        const permissions = JSON.parse(role.permissions)
        Object.keys(permissions).forEach((model: string) => {
          Object.keys(permissions[model].actions).forEach(action => {
            if (accesses[model]) {
              accesses[model].actions[action] = false
            } else {
              accesses[model] = { actions: { [action]: false } }
            }
          })
        })
      }
    } else {
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
    }
    return accesses
  }
}
