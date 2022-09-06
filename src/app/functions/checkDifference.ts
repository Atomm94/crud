import _, { isNull } from 'lodash'
// import { formatKeyValue } from './formatObjectKeys'

export async function getObjectDiff (obj1: { [key: string]: any }, obj2: { [key: string]: any }) { // new, old
    const diff: { [key: string]: any } = {}
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            const value = obj1[key]
            if (obj2.hasOwnProperty(key) && obj2[key] !== value) {
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && !isNull(obj2[key]) && !isNull(obj1[key])) {
                    if (obj1[key]) obj1[key].id = obj1.id
                    if (obj2[key]) obj2[key].id = obj2.id
                    const diff1 = await getObjectDiff(obj1[key], obj2[key])
                    if (Object.keys(diff1).length) diff[key] = diff1
                } else diff[key] = value
            }
            if (!obj2.hasOwnProperty(key)) {
                diff[key] = value
            }
        }
    }
    if (diff.hasOwnProperty('password')) {
        if (_.isNull(diff.password)) {
            delete diff.password
        } else {
            diff.password = 'hiden'
        }
    }
    return diff
}
