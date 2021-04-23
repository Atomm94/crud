import MQTTBroker from '../mqtt/mqtt'
import { ReceiveTopics } from '../mqtt/Topics'
import Parse from './Parse'
// import { OperatorType } from '../mqtt/Operators'

export default class MessageHandler {
    constructor () {
        MQTTBroker.getMessage((topic: ReceiveTopics, message: string) => {
            console.log('getMessages topic', topic, message)
            switch (topic) {
                case ReceiveTopics.MQTT_CRUD:
                    Parse.deviceData(topic, message)
                    break
                default:
                    break
            }
        })
    }
}
