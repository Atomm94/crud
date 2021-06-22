import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'

export default class SendDeviceMessage {
    readonly operator: string
    readonly topic: string
    readonly message_id: string
    readonly session_id: string
    readonly update: boolean
    readonly data: any
    readonly user: number | null
    readonly user_data: any

    constructor (operator: string, location: string, device_id: number, data: any = 'none', user: any = null, session_id: string | null = '0', update: boolean = false, message_id: string = new Date().getTime().toString()) {
        this.operator = operator
        this.topic = `${location}/registration/${device_id}/Operate/`
        this.topic = `5/5/registration/${device_id}/Operate/`
        this.message_id = message_id
        this.session_id = session_id || '0'
        this.update = update
        this.data = data
        this.user = user ? user.id : null
        this.user_data = user
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(this))
    }
}
