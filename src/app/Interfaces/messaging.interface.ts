import { OperatorType } from '../mqtt/Operators'

export interface ICrudMqttMessaging {
    operator: OperatorType
    topic: string
    message_id: string
    session_id: string
    update: boolean
    data: any
    user: number | null
    user_data: any
}

export interface IDeviceMqttMessaging {
    operator: OperatorType,
    message_id: string,
    session_id: string,
    info: any,
    result: {
        errorNo: number,
        description?: string
        time: number,
    }
}

export interface IMqttCrudMessaging extends IDeviceMqttMessaging {
    device_topic: string,
    location: string,
    company: number,
    device_id: number,
    send_data: ICrudMqttMessaging
}
