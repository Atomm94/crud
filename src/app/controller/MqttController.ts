import { DefaultContext } from 'koa'
import { Company } from '../model/entity'
import MQTTBroker from '../mqtt/mqtt'
import { SendTopics } from '../mqtt/Topics'
// import { TopicCodes } from '../mqtt/Topics'

export default class MqttController {
    /**
     *
     * @swagger
     * /mqttGetRequest/{id}:
     *      get:
     *          tags:
     *              - Mqtt
     *          summary: Return Broker params by id
     *          parameters:
     *              - name: id
     *                in: path
     *                required: true
     *                description: Parameter description
     *                schema:
     *                    type: integer
     *                    format: int64
     *                    minimum: 1
     *          responses:
     *              '200':
     *                  description: Data object
     *              '404':
     *                  description: Data not found
     */
    public static async get (ctx: DefaultContext) {
        try {
            const main_id = +ctx.params.id
            const where = { account: main_id }
            const company: any = await Company.findOne({ where: where })
            if (!company) {
                ctx.status = 400
                ctx.body = {
                    message: 'Invalid id!!'
                }
            } else {
                const location = `${main_id}/${company.id}`
                ctx.body = {
                    BrokerAdr: 'lumiring.msg.th',
                    BrokerPort: 3285,
                    ClientID: '101FRE1111325665454RETV123355',
                    Use_SSL: false,
                    use_enryption: false,
                    User_Name: 'TR2584567452121TFD',
                    User_Pass: 'ASTR565VFDF8787fdtrtJ76p',
                    Location: location
                }
                // const send_message = {
                //     operator: 'registration',
                //     info: {
                //         model: 'sdfsdf',
                //         device_id: 1221
                //     }
                // }

                // '587123122/54854123/Registration/123456789/Operate/Ack'
                // MQTTBroker.publishMessage('12548799/5/registration/Events', JSON.stringify(send_message))

                // const send_message1 = {
                //     operator: 'accept',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '0',
                //     message_id: '222222222222',
                //     info: 'none'
                // }

                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_message1))

                // const set_status = {
                //     operator: 'SetMQTTSettings',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '0',
                //     message_id: '0',
                //     info:
                //     {
                //         BrokerAdr: '158.85.225.154',
                //         BrokerPort: 1883,
                //         ClientID: false,
                //         Use_SSL: false,
                //         User_Name: 'unimacs',
                //         User_Pass: 'tThc7W7DFv',
                //         Location: '5/5/registration',
                //         DeviceID: '1073493824',
                //         use_enryption: false
                //     }
                // }

                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(set_status))

                // const get_status = {
                //     operator: 'GetMQTTSettings',
                //     location: '5/5/registration',
                //     device_id: '1073493652',
                //     session_id: '0',
                //     message_id: '222222222222',
                //     info: 'none'
                // }

                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(get_status))

                // / ///////////////// login_ack message
                // const login = {
                //     operator: 'login',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '0',
                //     message_id: '1111111111',
                //     info:
                //     {
                //         username: 'admin',
                //         password: 'a8ec1eddffbd28d479b38077c0244ed0'
                //     }
                // }
                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(login))

                // const set_pass = {
                //     operator: 'SetPass',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '0',
                //     message_id: '1111111111',
                //     info:
                //     {
                //         username: 'admin',
                //         password: 'admin',
                //         use_sha: 0
                //     }
                // }
                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(set_pass))

                /// ////////////// get_mqtt message

                // const get_mqtt = {
                //     operator: 'GetMQTTSettings',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '2222222222',
                //     message_id: '1111111111',
                //     info: 'none'
                // }
                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(get_mqtt))
                // const send_data: any = {
                //     operator: 'SetCtpDoor',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '52831102448461152410103211553534',
                //     message_id: (new Date().getTime()).toString(),
                //     info:
                //     {
                //         Control_point_idx: 3
                //     }
                // }
                //     MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))

                const send_data: any = {
                    operator: 'SetSdlDaily',
                    location: '5/5',
                    device_id: '1073493824',
                    session_id: '52831102448461152410103211553534',
                    message_id: '5464545',
                    info: {
                        Shedule_id: 3,
                        Ctp_idx: 3,
                        TmStart: '3600',
                        TmEnd: '7200'
                    }
                }

                MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
                // const get_status = {
                //         operator: 'GetStatusACU',
                //         location: '5/5',
                //         device_id: '1073493824',
                //         session_id: '1111111111',
                //         message_id: '222222222222',
                //         info: 'none'
                //     }
                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(get_status))
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
