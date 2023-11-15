import { accessPointType } from '../../enums/accessPointType.enum'
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class CtpController {
    public static async setCtp (type: accessPointType, location: string, serial_number: number, data: any, user: any, session_id: string | null = '0', update: boolean = false) {
        let operator = OperatorType.SET_CTP_DOOR
        if (type === accessPointType.TURNSTILE_ONE_SIDE || type === accessPointType.TURNSTILE_TWO_SIDE) {
            operator = OperatorType.SET_CTP_TURNSTILE
        } else if (type === accessPointType.GATE) {
            operator = OperatorType.SET_CTP_GATE
        } else if (type === accessPointType.GATEWAY) {
            operator = OperatorType.SET_CTP_GATEWAY
        } else if (type === accessPointType.FLOOR) {
            operator = OperatorType.SET_CTP_FLOOR
        }

        if (data.readers) delete data.readers // Readers we set in SetRd-Ack..
        if (data.resources && typeof data.resources === 'string') data.resources = JSON.parse(data.resources)

        if (!update && !data.resourcesForSendDevice) data.resourcesForSendDevice = data.resources

        new SendDeviceMessage(operator, location, serial_number, data, user, session_id, update)
    }

    public static async delCtp (type: accessPointType, location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        let operator = OperatorType.DEL_CTP_DOOR
        if (type === accessPointType.TURNSTILE_ONE_SIDE || type === accessPointType.TURNSTILE_TWO_SIDE) {
            new SendDeviceMessage(OperatorType.DEL_CTP_TURNSTILE, location, serial_number, data, user, session_id)
            operator = OperatorType.DEL_CTP_TURNSTILE
        } else if (type === accessPointType.GATE) {
            operator = OperatorType.DEL_CTP_GATE
        } else if (type === accessPointType.GATEWAY) {
            operator = OperatorType.DEL_CTP_GATEWAY
        } else if (type === accessPointType.FLOOR) {
            operator = OperatorType.DEL_CTP_FLOOR
        }
        new SendDeviceMessage(operator, location, serial_number, data, user, session_id)
    }

    public static async singlePass (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.SINGLE_PASS, location, serial_number, data, user, session_id)
    }

    public static async webPass (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.WEB_PASS, location, serial_number, data, user, session_id)
    }

    public static async setAccessMode (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.SET_ACCESS_MODE, location, serial_number, data, user, session_id)
    }

    public static async activateCredential (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.ACTIVATE_CREDENTIAL, location, serial_number, data, user, session_id)
    }
}
