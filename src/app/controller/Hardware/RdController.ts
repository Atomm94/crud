import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class RdController {
    public static async setRd (location: string, serial_number: number, reader: any, user: any, session_id: string | null = '', reader_update?: boolean) {
        new SendDeviceMessage(OperatorType.SET_RD, location, serial_number, reader, user, session_id, reader_update)
    }

    public static async delRd (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.DEL_RD, location, serial_number, data, user, session_id)
    }
}
