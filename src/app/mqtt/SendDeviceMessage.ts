import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'
const send_device_commands_interval = process.env.SEND_DEVICE_COMMANDS_INTERVAL ? Number(process.env.SEND_DEVICE_COMMANDS_INTERVAL) : 500

export default class SendDeviceMessage {
    readonly operator: string
    readonly topic: string
    readonly message_id: string
    readonly session_id: string
    readonly update: boolean
    readonly data: any
    readonly user: number | null
    readonly user_data: any
    public static device_send_commands_qty: any = {}

    constructor (operator: string, location: string, device_id: number, data: any = 'none', user: any = null, session_id: string | null = '0', update: boolean = false, message_id: string = new Date().getTime().toString()) {
        if (!device_id) {
        } else {
            this.operator = operator
            this.topic = `${location}/registration/${device_id}/Operate/`
            // this.topic = `5/5/registration/${device_id}/Operate/`
            this.message_id = message_id
            this.session_id = session_id || '0'
            this.update = update
            this.data = data
            this.user = user ? user.id : null
            this.user_data = user

            const key = this.topic
            if (key in SendDeviceMessage.device_send_commands_qty) {
                SendDeviceMessage.device_send_commands_qty[key]++
            } else {
                SendDeviceMessage.device_send_commands_qty[key] = 1
            }
            const qty = SendDeviceMessage.device_send_commands_qty[key]

            const self = this
            // console.log(new Date(), 1, JSON.stringify(SendDeviceMessage.device_send_commands_qty), self.operator, key, key in SendDeviceMessage.device_send_commands_qty)
            setTimeout(() => {
                MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(self))
                SendDeviceMessage.device_send_commands_qty[key]--
                if (SendDeviceMessage.device_send_commands_qty[key] <= 0) delete SendDeviceMessage.device_send_commands_qty[key]
            }, (qty - 1) * send_device_commands_interval)
        }
    }
}
