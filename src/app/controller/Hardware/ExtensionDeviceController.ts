
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class ExtensionDeviceController {
    public static async setExtBrd (location: string, serial_number: number, data: any, user: number | null = null, session_id: string | null = '0', update?: boolean) {
        new SendDeviceMessage(OperatorType.SET_EXT_BRD, location, serial_number, data, user, session_id, update)
    }

    public static async delExtBrd (location: string, serial_number: number, data: any, user: number | null = null, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.DEL_EXT_BRD, location, serial_number, data, user, session_id)
    }
}
