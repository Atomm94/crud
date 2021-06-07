import {
  Column,
  Entity,
  OneToMany,
  JoinColumn,
  ManyToOne
  // Index
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

// @Index('slug|company', ['slug', 'company'], { unique: true })

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

  public static serviceResource: boolean = true

  public static default_partner_role: any = {
    ClientCompany: {
      actions: {
        getItem: true,
        updateItem: true
      }
    },
    Role: {
      actions: {
        getItem: true,
        getRole: true,
        getAllAccess: true
      }
    },
    Product: {
      actions: {
        getItem: true,
        getAllItems: true
      }
    },
    Department: {
      actions: {
        getAllItems: true
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

  public static default_cardholder_role: any = {
    Role: {
      actions: {
        getItem: true
      }
    },
    Product: {
      actions: {
        updateItem: true,
        getItem: true,
        getAllItems: true,
        destroyItem: true
      }
    },
    Department: {
      actions: {
        getAllItems: true
      }
    },
    Admin: {
      actions: {
        getItem: true
      }
    },
    Cardholder: {
      actions: {
        addItem: true,
        updateItem: true,
        getItem: true,
        getAllItems: true,
        destroyItem: true
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
    },
    AccessRight: {
      actions: {
        addItem: true,
        getItem: true
      }
    },
    AccessPointZone: {
      actions: {
        addItem: true,
        updateItem: true,
        getItem: true,
        destroyItem: true,
        getAllItems: true
      }
    },
    Acu: {
      actions: {
        getItem: true,
        getAllItems: true
      }
    }
  }

  public static async addItem (data: Role): Promise<Role> {
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

  public static async updateItem (data: Role): Promise<{ [key: string]: any }> {
    const role = await this.findOneOrFail({ id: data.id })
    const oldData = Object.assign({}, role)

    if ('slug' in data) role.slug = data.slug
    if ('permissions' in data) role.permissions = data.permissions
    if ('status' in data) role.status = data.status
    // if ('main' in data) role.main = data.main

    if (!role) return { status: 400, message: 'Item not found' }
    return new Promise((resolve, reject) => {
      this.save(role)
        .then((item: Role) => {
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

  public static async getItem (id: number, where?: any, relations?: Array<string>): Promise<Role> {
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

  public static async destroyItem (data: any) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
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

  public static async getAllItems (params?: any): Promise<Role[]> {
    return new Promise((resolve, reject) => {
      this.findByParams(params)
        .then((items: Role[]) => {
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
    if (!user.super) {
      const where: { id: number, company?: number } = { id: user.role }
      if (user.company) where.company = user.company
      const role = await Role.findOne(where)
      if (role) {
        const permissions = JSON.parse(role.permissions)
        Object.keys(permissions).forEach((model: string) => {
          if (permissions[model].actions) {
            Object.keys(permissions[model].actions).forEach(action => {
              if (accesses[model]) {
                if (accesses[model].actions) {
                  accesses[model].actions[action] = false
                } else {
                  accesses[model].actions = {
                    [action]: false
                  }
                }
              } else {
                accesses[model] = { actions: { [action]: false } }
              }
            })
          }
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
