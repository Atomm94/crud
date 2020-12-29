import _ from 'lodash'

export function getObjectDiff (obj1: { [key: string]: any }, obj2: { [key: string]: any }) {
    const diff: { [key: string]: any } = {}
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            const value = obj1[key]
            if (obj2.hasOwnProperty(key) && obj2[key] !== value) {
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
