import _ from 'lodash'
import { ObjectKeyDiff, objectValuesDiff } from '../enums/objectDiff.enum'
import { ExtDevice, AccessPoint } from '../model/entity'
import acuModels from '../model/entity/acuModels.json'

export async function getObjectDiff (obj1: { [key: string]: any }, obj2: { [key: string]: any }) { // new, old
    let diff: { [key: string]: any } = {}
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            let value = obj1[key]
            if (obj2.hasOwnProperty(key) && obj2[key] !== value) {
                try {
                    if (typeof obj1[key] !== 'object') {
                        obj1[key] = JSON.parse(obj1[key])
                        obj2[key] = JSON.parse(obj2[key])
                    }
                    if (typeof obj1[key] === 'object') {
                        obj1[key].id = obj1.id
                        obj2[key].id = obj2.id
                        const diff1 = await getObjectDiff(obj1[key], obj2[key])
                        diff = { ...diff, ...diff1 }
                    } else {
                        const formattedValues = await formatKeyValue(key, value, obj1)
                        key = formattedValues.key
                        value = formattedValues.value
                        diff[key] = value
                    }
                } catch (err) {
                    const formattedValues = await formatKeyValue(key, value, obj1)
                    key = formattedValues.key
                    value = formattedValues.value
                    diff[key] = value
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

async function formatKeyValue (key: string, value: any, obj: Record<string, unknown>) {
    console.log(key, value, obj)
    if (key in objectValuesDiff) value = objectValuesDiff[key as keyof typeof objectValuesDiff][value as keyof typeof Object.keys]
    if (key in ObjectKeyDiff) key = ObjectKeyDiff[key as keyof typeof ObjectKeyDiff]
    if ((key === 'output' || key === 'input') && obj.component_source === 0) {
        try {
            const access_point = await AccessPoint.findOneOrFail({ relations: ['acus'], where: { id: obj.id } })
            if (!access_point) {
                value = null
            } else {
                const model = access_point?.acus.model
                const io = acuModels.controllers[model as keyof typeof Object.keys][`${key}s_info`][value] as {name: string}
                value = io.name
            }
        } catch (err) {
            value = null
        }
    }
    if (key === 'Component Source') {
        if (value === 0) {
            value = 'Acu'
        } else {
            try {
                const ext_device = await ExtDevice.findOneOrFail(value)
                value = ext_device.name
            } catch (err) {
                value = null
            }
        }
    }
    return { key, value }
}
