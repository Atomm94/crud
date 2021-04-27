import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class RdController {
    public static async setRd () {
    }

    public static async delRd (location: string, serial_number: number, data: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.DEL_RD, location, serial_number, data, session_id)
    }
}
