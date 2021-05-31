
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class DeviceController {
    public static async setNetSettings (location: string, serial_number: number, data: any, user: number | null = null, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_NET_SETTINGS, location, serial_number, data, user, session_id, update)
    }

    public static async setDateTime (location: string, serial_number: number, data: any, user: number | null = null, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_DATE_TIME, location, serial_number, data, user, session_id, update)
    }

    public static async delDevice (operator:string, location: string, serial_number: number, data: any, user: number | null = null, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.CANCEL_REGISTRATION, location, serial_number, data, user, session_id)
    }
}
