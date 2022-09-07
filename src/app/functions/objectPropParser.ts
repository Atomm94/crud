import { UnusedObjectKeys } from '../enums/objectDiff.enum'
import { AccPointResourceTypes } from '../enums/resourceTypes.enum'
import { formatKeyValue } from './formatObjectKeys'

export const parseObjNestedJSONProps = async (obj: { [key: string]: any }, id?:number) => {
    if (!id) id = obj.id
    const parsedObjClone: { [key: string]: any } = {}
    for (const key in obj) {
        if (key in UnusedObjectKeys || (key === 'name' && obj[key] in AccPointResourceTypes)) continue
        if (Object.prototype.toString.call(obj[key]) === '[object Date]') obj[key] = obj[key].toISOString()

        try {
            const parsedObj = JSON.parse(obj[key])
            if (parsedObj && typeof parsedObj === 'object') {
                const newParsedJSON = await parseObjNestedJSONProps(parsedObj, id)
                parsedObjClone[key] = newParsedJSON
            } else {
                const formattedValues = await formatKeyValue(key, obj[key], obj, id)
                parsedObjClone[formattedValues.key] = formattedValues.value
            }
        } catch (err) {
            if (obj[key] && typeof obj[key] === 'object') {
                const newParsedJSON = await parseObjNestedJSONProps(obj[key], id)
                parsedObjClone[key] = newParsedJSON
            } else {
                const formattedValues = await formatKeyValue(key, obj[key], obj, id)
                parsedObjClone[formattedValues.key] = formattedValues.value
            }
        }
    }
    return parsedObjClone
}
