import { formatKeyValue } from './formatObjectKeys'
import _ from 'lodash'

export const parseObjNestedJSONProps = async (obj: { [key: string]: any }) => {
    const parsedObjClone: { [key: string]: any } = {}
    for (const key in obj) {
        try {
            const parsedObj = JSON.parse(obj[key])
            if (parsedObj && typeof parsedObj === 'object' && !_.isNull(parsedObj)) {
                const newParsedJSON = await parseObjNestedJSONProps(parsedObj)
                parsedObjClone[key] = newParsedJSON
            } else {
                const formattedValues = await formatKeyValue(key, obj[key], obj)
                parsedObjClone[formattedValues.key] = formattedValues.value
            }
        } catch (err) {
            const formattedValues = await formatKeyValue(key, obj[key], obj)
            parsedObjClone[formattedValues.key] = formattedValues.value
            continue
        }
    }
    return parsedObjClone
}
