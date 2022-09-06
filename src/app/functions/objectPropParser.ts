import { formatKeyValue } from './formatObjectKeys'

export const parseObjNestedJSONProps = async (obj: { [key: string]: any }) => {
    const parsedObjClone: { [key: string]: any } = {}
    for (const key in obj) {
        if (Object.prototype.toString.call(obj[key]) === '[object Date]') obj[key] = obj[key].toISOString()

        try {
            const parsedObj = JSON.parse(obj[key])
            if (parsedObj && typeof parsedObj === 'object') {
                const newParsedJSON = await parseObjNestedJSONProps(parsedObj)
                parsedObjClone[key] = newParsedJSON
            } else {
                const formattedValues = await formatKeyValue(key, obj[key], obj)
                parsedObjClone[formattedValues.key] = formattedValues.value
            }
        } catch (err) {
            if (obj[key] && typeof obj[key] === 'object') {
                const newParsedJSON = await parseObjNestedJSONProps(obj[key])
                parsedObjClone[key] = newParsedJSON
            } else {
                const formattedValues = await formatKeyValue(key, obj[key], obj)
                parsedObjClone[formattedValues.key] = formattedValues.value
            }
        }
    }
    return parsedObjClone
}
