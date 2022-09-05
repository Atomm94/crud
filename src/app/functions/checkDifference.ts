import _, { isNull } from 'lodash'
import { formatKeyValue } from './formatObjectKeys'

export async function getObjectDiff (obj1: { [key: string]: any }, obj2: { [key: string]: any }) { // new, old
    let diff: { [key: string]: any } = {}
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            let value = obj1[key]
            if (obj2.hasOwnProperty(key) && obj2[key] !== value) {
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && !isNull(obj2[key]) && !isNull(obj1[key])) {
                    if (obj1[key]) obj1[key].id = obj1.id
                    if (obj2[key]) obj2[key].id = obj2.id
                    const diff1 = await getObjectDiff(obj1[key], obj2[key])
                    diff = { ...diff, ...diff1 }
                } else {
                    const formattedValues = await formatKeyValue(key, value, obj1)
                    key = formattedValues.key
                    value = formattedValues.value
                    if (typeof value === 'object' && !isNull(value)) diff = { ...diff, ...value }
                    else diff[key] = value
                }
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
