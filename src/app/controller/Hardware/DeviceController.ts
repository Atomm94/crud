import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'
export default class DeviceController {
    public static async setNetSettings (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_NET_SETTINGS, location, serial_number, data, user, session_id, update)
    }

    public static async setDateTime (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_DATE_TIME, location, serial_number, data, user, session_id, update)
    }

    public static async delDevice (operator:string, location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.CANCEL_REGISTRATION, location, serial_number, data, user, session_id)
    }

    public static async ping (location: string, serial_number: number, data: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.PING, location, serial_number, data, session_id)
    }

    public static async setHeartBit (location: string, serial_number: number, data: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.SET_HEART_BIT, location, serial_number, data, session_id)
    }

    public static async setTask (location: string, serial_number: number, data: any, user:any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.SET_TASK, location, serial_number, data, user, session_id, update)
    }

    public static async resetApb (location: string, serial_number: number, data: any, user:any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.RESET_APB, location, serial_number, data, user, session_id, update)
    }

    public static async maintain (location: string, serial_number: number, data: any, user:any, session_id: string | null = '0', update: boolean = false) {
        new SendDeviceMessage(OperatorType.MAIN_TAIN, location, serial_number, data, user, session_id, update)
    }
}
