import { socketChannels } from '../enums/socketChannels.enum'
import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'

    export default class SendSocketMessage {
        readonly topic: string = SendTopics.MQTT_SOCKET
        readonly channel: string
        readonly data: any

        constructor (channel: socketChannels, data: any) {
            this.channel = channel
            this.data = data
            MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(this))
        }
    }
