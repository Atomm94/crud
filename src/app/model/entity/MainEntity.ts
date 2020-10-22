import {
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    Index,
    getRepository,
    // BeforeInsert,
    // BeforeUpdate,
    // JoinTable,
    // OneToMany,
    // ObjectIdColumn,
    // ObjectID
    Not,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual,
    Equal,
    Like,
    Between,
    In
} from 'typeorm'

export abstract class MainEntity extends BaseEntity {
    @Index()
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', name: 'create_date' })
    createDate: string;

    @UpdateDateColumn({ type: 'timestamp', name: 'update_date' })
    updateDate: string;

    public static async findByParams (data: any) {
        const where: any = {}
        if (data.where) {
            data.where = JSON.parse(data.where)
            Object.keys(data.where).forEach(column => {
                Object.keys(data.where[column]).forEach((el: any) => {
                    where[column] = this.changeAdvancedOptions(el, data.where[column][el])
                })
            })
        }

        const take = data.page ? data.page_items_count ? (data.page_items_count > 10000) ? 10000 : data.page_items_count : 25 : 100
        const skip = data.page_items_count && data.page ? (data.page - 1) * data.page_items_count : 0

        const [result, total] = await this.findAndCount({
            where: where,
            order: data.sort ? { [data.sort.split(' ')[0]]: data.sort.split(' ')[1] } : { id: 'DESC' },
            take: take,
            skip: skip
        })

        if (data.page) {
            return {
                data: result,
                count: total
            }
        } else {
            return result
        }
    }

    public static changeAdvancedOptions (option: string, value: any) {
        let res: any = null
        switch (option) {
            case '!=':
                res = Not(value)
                break
            case '<':
                res = LessThan(value)
                break
            case '<=':
                res = LessThanOrEqual(value)
                break
            case '>':
                res = MoreThan(value)
                break
            case '>=':
                res = MoreThanOrEqual(value)
                break
            case '=':
                res = Equal(value)
                break
            case 'in':
                res = In(value)
                break
            case 'nin':
                res = Not(In(value))
                break
            case 'contains':
                res = Like(`% ${value} %`)
                break
            case 'startsWith':
                res = Like(`${value} %`)
                break
            case 'endsWith':
                res = Like(`% ${value}`)
                break
            case 'between':
                res = Between(value[0], value[1])
                break

            default:
                break
        }
        return res
    }

    public static getActions () {
        const self: any = this
        const model_actions = Object.getOwnPropertyNames(self)
            .filter((item: any) => typeof self[item] === 'function')
        // console.log('model_actions', model_actions)

        const MainEntityClass: any = MainEntity
        const MainEntity_actions = Object.getOwnPropertyNames(MainEntityClass)
            .filter((item: any) => typeof MainEntityClass[item] === 'function' && model_actions.indexOf(item) === -1)
        // console.log('MainEntity_actions', MainEntity_actions)

        return [...model_actions, ...MainEntity_actions]
    }

    public static getAttributes () {
        return getRepository(this).metadata.propertiesMap
    }

    public static getModelParams () {
        return {
            actions: this.getActions(),
            attributes: this.getAttributes()
        }
    }
}
