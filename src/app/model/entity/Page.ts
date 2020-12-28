import {
    Column,
    Entity,
    // ManyToOne,
    OneToMany,
    JoinColumn
    // Index,
    // CreateDateColumn,
    // UpdateDateColumn,
    // ObjectIdColumn,
    // ObjectID
    // PrimaryGeneratedColumn,
} from 'typeorm'
import { MainEntity } from './MainEntity'
import { Section } from './Section'

import { ITranslations } from '../../Interfaces/Translation'
@Entity('page')
export class Page extends MainEntity {
    @Column('longtext', { name: 'title', nullable: true })
    title: ITranslations[] | null

    @Column('longtext', { name: 'url', nullable: true })
    url: ITranslations[] | null

    @Column('longtext', { name: 'image', nullable: true })
    image: ITranslations[] | null

    @Column('longtext', { name: 'files', nullable: true })
    files: ITranslations[] | null

    @Column('longtext', { name: 'summary', nullable: true })
    summary: ITranslations[] | null

    @Column('longtext', { name: 'body', nullable: true })
    body: ITranslations[] | null

    @Column('longtext', { name: 'published', nullable: true })
    published: ITranslations[] | null

    @Column('longtext', { name: 'meta_title', nullable: true })
    meta_title: ITranslations[] | null

    @Column('longtext', { name: 'meta_keywords', nullable: true })
    meta_keywords: ITranslations[] | null

    @Column('boolean', { name: 'status', default: true })
    status: boolean | true;

    @Column('int', { name: 'parent_id', nullable: true })
    parent_id: number | null;

    @OneToMany(type => Section, section => section.page, { nullable: true })
    @JoinColumn({ name: 'section' })
    sections: Section[] | null;

    static gettingActions = false

    public static async addItem (data: any) {
        const page = new Page()

        page.title = data.title
        page.body = data.body
        page.url = data.url
        page.summary = data.summary
        page.published = data.published
        page.meta_title = data.meta_title
        page.meta_keywords = data.meta_keywords
        page.status = data.status === 'false' ? false : data.status === 'true' ? true : data.status
        page.files = data.files && data.files.length ? data.files : []
        page.image = data.image
        // page.parent_id = data.parent_id

        return new Promise((resolve, reject) => {
            this.save(page)
                .then((item: Page) => {
                    resolve({
                        old: page,
                        new: item
                    })
                })
                .catch((error: any) => {
                    reject(error)
                })
        })
    }

    public static async updateItem (data: any) {
        const page = await this.findOneOrFail(+data.id)

        if ('body' in data) page.body = data.body
        if ('title' in data) page.title = data.title
        if ('url' in data) page.url = data.url
        if ('summary' in data) page.summary = data.summary
        if ('published' in data) page.published = data.published
        if ('meta_title' in data) page.meta_title = data.meta_title
        if ('meta_keywords' in data) page.meta_keywords = data.meta_keywords
        if ('status' in data) page.status = data.status
        if ('files' in data) page.files = data.files && data.files.length ? data.files : []
        if ('image' in data) page.image = data.image
        if ('parent_id' in data) page.parent_id = data.parent_id

        if (!page) return { status: 400, message: 'Item not found' }
        return new Promise((resolve, reject) => {
            this.save(page)
                .then((item: Page) => {
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
                .then((item: Page) => {
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

    public static async getPageWithSection () {
        return await Page.createQueryBuilder('page')
            .select(['page', 'sections'])
            .leftJoin('page.sections', 'sections')
            .getMany()
    }

    public static async getPageById (id: number) {
        return await Page.createQueryBuilder('page')
            .select(['page', 'sections'])
            .where('page.id = :id', { id: id })
            .leftJoin('page.sections', 'sections')
            .getMany()
    }
}
