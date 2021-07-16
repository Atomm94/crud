import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class RdController {
    public static async setRd (location: string, serial_number: number, readers: any, user: any, session_id: string | null = '') {
        if (readers.length) {
            const send_data = {
                access_point: readers[0].access_point,
                access_point_type: readers[0].access_point_type,
                readers: readers
            }
            new SendDeviceMessage(OperatorType.SET_RD, location, serial_number, send_data, user, session_id)
        }
    }

    public static async delRd (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.DEL_RD, location, serial_number, data, user, session_id)
    }
}
