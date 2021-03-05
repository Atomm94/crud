import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'

export default class SendDeviceMessage {
    readonly operator: string
    readonly topic: string
    readonly message_id: string
    readonly session_id: string
    readonly data: any

    constructor (operator: string, location: string, device_id: number, data: any = 'none', session_id: string | null = '0', message_id: string = new Date().getTime().toString()) {
        this.operator = operator
        this.topic = `${location}/registration/${device_id}/Operate/`
        this.message_id = message_id
        this.session_id = session_id || '0'
        this.data = data
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(this))
    }
}
