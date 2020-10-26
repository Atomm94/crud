import { BaseClass } from './BaseClass'
import fs from 'fs'
import { join } from 'path'
const parentDir = join(__dirname, '.')

export class Module extends BaseClass {
    public static getModule () {
        return fs.readFileSync('./Module.json')
    }

    public static findModule () {
        const moduleData: any = fs.readFileSync(`${parentDir}/Module.json`)
        return JSON.parse(moduleData)
    }

    public static async getModuleSelections () {
        return {
            empty_select: [{
                name: 'empty_select1',
                id: 1
            },
            {
                name: 'empty_select112',
                id: 2
            }]
        }
    }

    public static async createModuleData () {
        return 'ok'
    }
}
