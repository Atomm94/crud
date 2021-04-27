
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class CredentialController {
    public static async setCardKey () {

    }

    public static async delCardKey (location: string, serial_number: number, data: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.EDIT_KEY, location, serial_number, data, session_id)
    }

    public static async updateStatus (location: string, serial_number: number, data: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.EDIT_KEY, location, serial_number, data, session_id)
    }
}
