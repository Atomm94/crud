
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class DeviceController {
    public static async setNetSettings (location: string, serial_number: number, data: any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_NET_SETTINGS, location, serial_number, data, session_id, update)
    }

    public static async setDateTime (location: string, serial_number: number, data: any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_DATE_TIME, location, serial_number, data, session_id, update)
    }
}
