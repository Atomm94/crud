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

import * as Models from '../entity/index'
import fs from 'fs'
import appRoot from 'app-root-path'
import path from 'path'
const public_path = path.join(appRoot.path, 'src/public')
const upload_files_path: string = process.env.UPLOAD_FILES_PATH ? process.env.UPLOAD_FILES_PATH : 'tmp/'
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

        let file_path
        if (New.avatar && New.avatar !== Old.avatar) {
            file_path = New.avatar
        } else if (New.file && New.file !== Old.file) {
            file_path = New.file
        } else if (New.image && New.image !== Old.image) {
            file_path = New.image
        }
console.log('000000000000000')

        if (file_path) {
            console.log('file_path', file_path)

            file_path = JSON.parse(file_path).path
            if (!fs.existsSync(file_path)) file_path = `${public_path}/${file_path}`

            if (!fs.existsSync(file_path)) {
                console.log('11111111')

                if (New.avatar) {
                    New.avatar = Old.avatar
                } else if (New.file) {
                    New.file = Old.file
                } else if (New.image) {
                    New.image = Old.image
                }
            } else {
                console.log('222222222')

                if (!fs.existsSync(`${public_path}/${upload_files_path}${model_name}/${New.id}`)) {
                    console.log('check', !fs.existsSync(`${public_path}/${upload_files_path}${model_name}/${New.id}`))

                    fs.mkdirSync(`${public_path}/${upload_files_path}${model_name}/${New.id}`, { recursive: true })
                    console.log('mkdirsync', fs.mkdirSync(`${public_path}/${upload_files_path}${model_name}/${New.id}`, { recursive: true }))
                }
                const new_path = {
                    path: `${upload_files_path}${model_name}/${New.id}/${path.basename(file_path)}`
                }
                console.log('new_path', new_path)

                try {
                    fs.renameSync(`${file_path}`, `${public_path}/${new_path.path}`)
                    console.log('3333333', fs.renameSync(`${file_path}`, `${public_path}/${new_path.path}`))
                } catch (error) {
                    console.log(error)
                }

                    if (New.avatar) {
                        New.avatar = JSON.stringify(new_path)
                    } else if (New.file) {
                        New.file = JSON.stringify(new_path)
                    } else if (New.image) {
                        New.image = JSON.stringify(new_path)
                    }
                }
            }
        } catch (error) {
            console.log('MAIN ENTITY beforeUpdate', error)
        }
    }

    async afterInsert (event: InsertEvent<MainEntity>) {
        try {
            const data: any = event.entity
            const models: any = Models
            const model_name: any = data.constructor.name

            let file_path
            if (data.avatar) {
                file_path = data.avatar
            } else if (data.file) {
                file_path = data.file
            } else if (data.image) {
                file_path = data.image
            }
            if (file_path) {
                file_path = JSON.parse(file_path).path

                if (!fs.existsSync(`${public_path}/${upload_files_path}${model_name}`)) {
                    fs.mkdirSync(`${public_path}/${upload_files_path}${model_name}`, { recursive: true })
                }

                fs.mkdirSync(`${public_path}/${upload_files_path}${model_name}/${data.id}`)
                const new_path = {
                    path: `${upload_files_path}${model_name}/${data.id}/${file_path}`
                }
                try {
                    fs.renameSync(`${public_path}/${file_path}`, `${public_path}/${new_path.path}`)
                } catch (error) {
                    console.log(error)
                }
                await event.queryRunner.commitTransaction()
                    .then(async () => {
                        event.queryRunner.startTransaction()
                            .then(async () => {
                                const update_data: any = await models[model_name].findOne({ id: data.id })
                                if (data.avatar) {
                                    update_data.avatar = JSON.stringify(new_path)
                                } else if (data.file) {
                                    update_data.file = JSON.stringify(new_path)
                                } else if (data.image) {
                                    update_data.image = JSON.stringify(new_path)
                                }
                                await update_data.save()
                            }).catch(error => {
                                console.log('transaction error', error)
                            })
                    }).catch(error => {
                        console.log('transaction error 2', error)
                    })
            }
        } catch (error) {
            console.log('MAIN ENTITY afterInsert', error)
        }
    }
}
