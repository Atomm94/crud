import fs from 'fs'
import { logger } from '../../../modules/winston/logger'
import { join } from 'path'
const parentDir = join(__dirname, '../..')

export function fileSave (imageFile: any) {
    const imagePath = imageFile.path.split('/')
    const path = imagePath[imagePath.length - 1]

    const dirtyImagePath = imageFile.name.split('.')
    const imageType = dirtyImagePath[dirtyImagePath.length - 1]
    const newName = path.concat(`.${imageType}`).split('upload_')[1]

    try {
        fs.rename(`${parentDir}/public/tmp/${path}`, `${parentDir}/public/tmp/${newName}`, (err) => {
            if (err) throw err
            logger.info('Rename complete!')
        })
    } catch (error) {
        logger.info('Rename complete!')
        return false
    }

    return { name: imageFile.name, path: `tmp/${newName}` }
}

export function capitalizeFirst (string: string) {
    if (typeof string !== 'string') return ''
    return string.charAt(0).toUpperCase() + string.slice(1)
}
