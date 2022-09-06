import { objectValuesDiff, ObjectKeyDiff } from '../enums/objectDiff.enum'
import { AccessPoint, ExtDevice } from '../model/entity'
import acuModels from '../model/entity/acuModels.json'

export async function formatKeyValue (key: string, value: any, obj: Record<string, unknown>) {
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
    if (key === 'component_source') {
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
