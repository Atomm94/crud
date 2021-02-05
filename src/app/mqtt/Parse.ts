import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'
import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'

export default class Parse {
    public static deviceData (topic: string, message: string) {
        const data = JSON.parse(message)
        switch (data.operator) {
            case OperatorType.REGISTRATION:
                this.deviceRegistration(topic, data)
                break
            case OperatorType.ACCEPT_ACK:
                this.deviceAcceptAck(data)
                break
            default:
                break
        }
    }

    public static async deviceRegistration (topic: string, data: any) {
        try {
            const acu_data = data.info
            const company = Number(data.topic.split('/')[1])
            acu_data.company = company
            acu_data.serial_number = acu_data.device_id

            const add: any = await Acu.addItem(acu_data)
            console.log('success:true', add)
            const send_data = {
                operator: OperatorType.ACCEPT,
                location: data.topic.split('/').slice(0, 2).join('/'),
                device_id: acu_data.serial_number
            }

            MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
        } catch (error) {
            console.log('error deviceRegistrion ', error)
        }
    }

    public static deviceAcceptAck (data: any): void {
        console.log('deviceAcceptAck')

        if (data.result.errorNo === 0) {
            // prcanq aperik
        }
    }
}
