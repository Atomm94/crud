import _ from 'lodash'

export function getObjectDiff (obj1: { [key: string]: any }, obj2: { [key: string]: any }) {
    const diff = Object.keys(obj1).reduce((result, key) => {
        if (!obj2.hasOwnProperty(key)) {
            result.push(key)
        } else if (_.isEqual(obj1[key], obj2[key])) {
            const resultKeyIndex = result.indexOf(key)
            result.splice(resultKeyIndex, 1)
        }
        return result
    }, Object.keys(obj2))

    return diff
}
