import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent,
    InsertEvent
    // SaveOptions
    // Connection,
    // RemoveEvent
} from 'typeorm'
// import * as Models from '../entity'
// import { Cardholder, CarInfo, Limitation } from '../entity'
// import { AntipassBack } from '../entity/AntipassBack'
import { MainEntity } from '../entity/MainEntity'

// import * as Models from '../entity/index'
import fs from 'fs'
import appRoot from 'app-root-path'
import path from 'path'
import { config } from '../../../config'

const public_path = path.join(appRoot.path, config.publicPath)

// const upload_files_path: string = process.env.UPLOAD_FILES_PATH ? process.env.UPLOAD_FILES_PATH : '/'
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<MainEntity> {
    /**
     * Indicates that this subscriber only listen to Company events.
     */
    listenTo () {
        return MainEntity
    }

    async beforeUpdate (event: UpdateEvent<MainEntity>) {
        // const { entity: New, databaseEntity: Old } = event
        try {
            const New: any = event.entity
            const Old: any = event.databaseEntity

            const model_name: any = New.constructor.name

            const fields = []
            if (New.avatar && New.avatar !== Old.avatar) {
                fields.push('avatar')
            }
            if (New.image && New.image !== Old.image) {
                fields.push('image')
            }
            if (New.file && New.file !== Old.file) {
                fields.push('file')
            }

            if (fields.length) {
                for (const field of fields) {
                    let file_path_objs = JSON.parse(New[field])
                    const old_field = JSON.parse(Old[field])
                    const is_array = Array.isArray(file_path_objs)
                    if (!is_array) file_path_objs = [file_path_objs]

                    if (old_field) {
                        if (!is_array) {
                            let del_path = `${public_path}/${old_field.path}`
                            if (!fs.existsSync(del_path)) del_path = `${public_path}/${old_field.path}`
                            fs.unlinkSync(del_path)
                        } else {
                            for (const old_file_obj of old_field) {
                                let is_del = true
                                for (const file_path_obj of file_path_objs) {
                                    if (old_file_obj.path === file_path_obj.path) {
                                        is_del = false
                                    }
                                }
                                if (is_del) {
                                    fs.unlinkSync(`${public_path}/${old_file_obj.path}`)
                                }
                            }
                        }
                    }

                    const new_file_path_objs = []
                    for (const file_path_obj of file_path_objs) {
                        let file_path = file_path_obj.path
                        const file_name = file_path_obj.name

                        if (!fs.existsSync(file_path)) file_path = `${public_path}/${file_path}`

                        if (!fs.existsSync(file_path)) {
                            if (!is_array) {
                                new_file_path_objs.push(old_field)
                            }
                        } else {
                            const file_base_name = path.basename(file_path)
                            fs.mkdirSync(`${public_path}/${model_name}/${file_base_name[0]}/${file_base_name[1]}`, { recursive: true })
                            if (!fs.existsSync(`${public_path}/${model_name}/${file_base_name[0]}/${file_base_name[1]}`)) {
                                fs.mkdirSync(`${public_path}/${model_name}/${file_base_name[0]}/${file_base_name[1]}`, { recursive: true })
                            }
                            const new_path = {
                                path: `${model_name}/${file_base_name[0]}/${file_base_name[1]}/${file_base_name}`,
                                name: file_name
                            }

                            try {
                                fs.renameSync(`${file_path}`, `${public_path}/${new_path.path}`)
                            } catch (error) {
                                console.log(error)
                            }

                            new_file_path_objs.push(new_path)
                        }
                    }
                    if (is_array) {
                        New[field] = new_file_path_objs.length ? JSON.stringify(new_file_path_objs) : null
                    } else {
                        New[field] = new_file_path_objs.length ? JSON.stringify(new_file_path_objs[0]) : null
                    }
                }
            }
        } catch (error) {
            console.log('MAIN ENTITY beforeUpdate', error)
        }
    }

    async beforeInsert (event: InsertEvent<MainEntity>) {
        try {
            const data: any = event.entity
            // const models: any = Models
            const model_name: any = data.constructor.name

            const fields: any = []
            if (data.avatar) {
                fields.push('avatar')
            }
            if (data.image) {
                fields.push('image')
            }
            if (data.file) {
                fields.push('file')
            }

            if (fields.length) {
                for (const field of fields) {
                    console.log('data[field]', data[field])

                    let file_path_objs = JSON.parse(data[field])
                    const is_array = Array.isArray(file_path_objs)
                    if (!is_array) file_path_objs = [file_path_objs]

                    const new_file_path_objs: any = []

                    for (const file_path_obj of file_path_objs) {
                        let file_path = file_path_obj.path
                        const file_name = file_path_obj.name

                        if (!fs.existsSync(file_path)) file_path = `${public_path}/${file_path}`

                        if (fs.existsSync(file_path)) {
                            const file_base_name = path.basename(file_path)
                            fs.mkdirSync(`${public_path}/${model_name}/${file_base_name[0]}/${file_base_name[1]}`, { recursive: true })
                            const new_path = {
                                path: `${model_name}/${file_base_name[0]}/${file_base_name[1]}/${file_base_name}`,
                                name: file_name
                            }

                            new_file_path_objs.push(new_path)

                            try {
                                fs.renameSync(`${file_path}`, `${public_path}/${new_path.path}`)
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    }

                    if (is_array) {
                        data[field] = new_file_path_objs.length ? JSON.stringify(new_file_path_objs) : null
                    } else {
                        data[field] = new_file_path_objs.length ? JSON.stringify(new_file_path_objs[0]) : null
                    }
                }
            }
        } catch (error) {
            console.log('MAIN ENTITY afterInsert', error)
        }
    }
}
