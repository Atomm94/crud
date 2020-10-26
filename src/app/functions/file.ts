import fs from 'fs'
import { logger } from '../../../modules/winston/logger'
import { join } from 'path'
const parentDir = join(__dirname, '../..')

export function fileSave (imageFile: any) {
    const imagePath = imageFile.path.split('/')
    const path = imagePath[imagePath.length - 1]

    const dirtyImagePath = imageFile.name.split('.')
    const imageType = dirtyImagePath[dirtyImagePath.length - 1]
    const newName = path.concat(`.${imageType}`)

    try {
        fs.rename(`${parentDir}/public/${path}`, `${parentDir}/public/${newName}`, (err) => {
            if (err) throw err
            logger.info('Rename complete!')
        })
    } catch (error) {
        logger.info('Rename complete!')
        return false
    }

    return { name: imageFile.name, path: newName }
}
