import {
    Column,
    Entity,
    JoinColumn,
    // JoinColumn,
    OneToOne
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
import { IMenu } from '../../Interfaces/Menu'
import { Page } from './Page'

@Entity('menu')
export class Menu extends MainEntity {
    @Column('longtext', { name: 'title', nullable: true })
    title: IMenu[] | null;

    @Column('varchar', { name: 'url', nullable: true, length: 255 })
    url: string | null;

    @Column('longtext', { name: 'translated_name', nullable: true })
    translated_name: { [key: string]: string[] } | null;

    @Column('longtext', { name: 'show', nullable: true })
    show: { [key: string]: string[] } | null;

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null;

    @Column('boolean', { name: 'status', default: true })
    status: boolean | true;

    @OneToOne(() => Page, { nullable: true })
    @JoinColumn()
    page: Page;

    public static async addItem (data: any) {
        const menu = new Menu()

        if ('title' in data) menu.title = data.title
        if ('url' in data) menu.url = data.url
        if ('translated_name' in data) menu.translated_name = data.translated_name
        if ('show' in data) menu.show = data.show
        if ('status' in data) menu.status = data.status
        if ('parent_id' in data) menu.parent_id = data.parent_id
        if ('page_id' in data) menu.page = data.page_id

        return new Promise((resolve, reject) => {
            this.save(menu)
                .then((item: Menu) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any) {
        const menu = await this.findOneOrFail(data.id)

        if ('title' in data) menu.title = data.title
        if ('url' in data) menu.url = data.url
        if ('translated_name' in data) menu.translated_name = data.translated_name
        if ('show' in data) menu.show = data.show
        if ('status' in data) menu.status = data.status
        if ('parent_id' in data) menu.parent_id = data.parent_id
        if ('page_id' in data) menu.page = data.page_id

        if (!menu) return { status: 400, messsage: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(menu)
                .then((item: Menu) => {
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
                .then((item: Menu) => {
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
                .then((items) => {
                    resolve(items)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }
}
