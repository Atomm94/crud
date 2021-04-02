import { socketChannels } from '../enums/socketChannels.enum'
import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'

export default class SendSocketMessage {
    readonly topic: string = SendTopics.MQTT_SOCKET
    readonly channel: string
    readonly data: any
    readonly company: number
    readonly user: number | null

    constructor (channel: socketChannels, data: any, company: number, user?: number| null) {
        this.channel = channel
        this.data = data
        this.company = company
        this.user = user || null
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(this))
    }
}
