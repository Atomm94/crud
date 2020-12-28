import {
    Entity,
    Column,
    ManyToOne
} from 'typeorm'

import { MainEntity } from './MainEntity'
import { Page } from './Page'
import { ITranslations } from '../../Interfaces/Translation'
@Entity('section')
export class Section extends MainEntity {
    @Column('longtext', { name: 'title', nullable: true })
    title: ITranslations[] | null

    @Column('longtext', { name: 'slug', nullable: true })
    slug: ITranslations[] | null

    @Column('longtext', { name: 'image', nullable: true })
    image: string | null

    @Column('longtext', { name: 'files', nullable: true })
    files: string[] | null

    @Column('longtext', { name: 'body', nullable: true })
    body: ITranslations[] | null

    @Column('longtext', { name: 'published', nullable: true })
    published: ITranslations[] | null

    @Column('int', { name: 'priority', nullable: true })
    priority: number | null;

    @Column('boolean', { name: 'status', default: true })
    status: boolean | true;

    @ManyToOne(type => Page, page => page.sections, { nullable: true })
    page: Page | null;

    static gettingActions = false

    public static async addItem (data: any) {
        const section = new Section()

        section.title = data.title ? data.title : null
        section.body = data.body ? data.body : null
        section.published = data.published ? data.published : null
        section.slug = data.slug ? data.slug : null
        section.status = true
        section.priority = 1
        section.page = data.id

        section.image = data.image ? data.image : null
        section.files = data.files && data.files.length ? data.files : []

        return new Promise((resolve, reject) => {
            this.save(section)
                .then((item: Section) => {
                    resolve(item)
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any) {
        const section = await this.findOneOrFail(data.id)

        if ('title' in data) section.title = data.title ? data.title : null
        if ('body' in data) section.body = data.body ? data.body : null
        if ('slug' in data) section.slug = data.slug ? data.slug : null
        if ('published' in data) section.published = data.published ? data.published : null
        if ('files' in data) section.files = data.files && data.files.length ? data.files : []
        if ('image' in data) section.image = data.image ? data.image : null

        // if ('priority' in data) section.priority = data.priority
        // if ('status' in data) section.status = data.status

        if (!section) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(section)
                .then((item: Section) => {
                    resolve({
                        old: section,
                        new: item
                    })
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
                .then((item: Section) => {
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
