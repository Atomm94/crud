import { DefaultContext } from 'koa'
import { Company } from '../model/entity'
// import { OperatorType } from '../mqtt/Operators'
// import SendDeviceMessage from '../mqtt/SendDeviceMessage'
import MQTTBroker from '../mqtt/mqtt'
// import { OperatorType } from '../mqtt/Operators'
import SendDeviceMessage from '../mqtt/SendDeviceMessage'
// import { SendTopics } from '../mqtt/Topics'
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
            // const user = ctx.user
            const where = { account: main_id }
            const company = await Company.findOneOrFail({ where: where })
            if (!company) {
                ctx.status = 400
                ctx.body = {
                    message: 'Invalid id!!'
                }
            } else {
                // const location = `${main_id}/${company.id}`
                // ctx.body = {
                //     BrokerAdr: 'lumiring.msg.th',
                //     BrokerPort: 3285,
                //     ClientID: '101FRE1111325665454RETV123355',
                //     Use_SSL: false,
                //     use_enryption: false,
                //     User_Name: 'TR2584567452121TFD',
                //     User_Pass: 'ASTR565VFDF8787fdtrtJ76p',
                //     Location: location
                // }
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
                //     location: '5/5',
                //     device_id: '1073493824',
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

                // new SendDeviceMessage('login', '5/5', 1073493824, login.info, '52831102448461152410103211553534')
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

                const send_data: any = {
                    operator: 'SetCtpTurnstile',
                    location: '5/5',
                    device_id: '1073493824',
                    session_id: '0',
                    message_id: (new Date().getTime()).toString(),
                    data:
                    {
                        id: 3
                    }
                }
                // const send_data2: any = {
                //     operator: 'GetStatusACU',
                //     session_id: '222222222222',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     info: 'none'
                //     }
                console.log('send_data', send_data)

                new SendDeviceMessage('SetCtpTurnstile', '5/5', 1073493824, {
                    id: 3
                }, 5, '52831102448461152410103211553534')
                    // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))

                // const send_data: any = {
                //     operator: 'SetSdlDaily',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '52831102448461152410103211553534',
                //     message_id: '5464545',
                //     info: {
                //         Shedule_id: 3,
                //         Ctp_idx: 32,
                //         TmStart: '3600',
                //         TmEnd: '7200'
                //     }
                // }
                // const send_data: any = {
                //     operator: 'SetSdlDaily',
                //     location: '5/5',
                //     device_id: '1073493824',
                //     session_id: '52831102448461152410103211553534',
                //     message_id: '5464545',
                //     info: {
                //         Shedule_id: 3,
                //         Ctp_idx: 3,
                //         TmStart: '3600',
                //         TmEnd: '7200'
                //     }
                // }

                // MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
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

            // const send_event = {
            //     operator: 'Event',
            //     session_id: '0',
            //     message_id: '0',
            //     info:
            //     {
            //         Group: 0,
            //         Stp_idx: 9,
            //         Event_id: 10,
            //         Key_id: 1,
            //         DateTm: 1599904641
            //     }
            // }
            // MQTTBroker.publishMessage('/1/5/1073493824/event', JSON.stringify(send_event))
            // const loginData = {
            //     username: 'admin',
            //     password: 'admin'
            // }
            // const message = new SendDeviceMessage(OperatorType.LOGIN, `${main_id}/${company.id}`, 1073493824, loginData)
            ctx.body = true
        } catch (error) {
            console.log(error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
 *
 * @swagger
 *  /mqttPostRequest:
 *      post:
 *          tags:
 *              - Mqtt
 *          summary: Creates a notification.
 *          parameters:
 *            - in: body
 *              name: notification
 *              description: The notification to create.
 *              schema:
 *                type: object
 *                required:
 *                  - operator
 *                  - session_id
 *                  - message_id
 *                  - topic
 *                  - info
 *                properties:
 *                  operator:
 *                      type: string
 *                      example: Event
 *                  session_id:
 *                      type: string
 *                      example: 0
 *                  message_id:
 *                      type: string
 *                      example: 0
 *                  topic:
 *                      type: string
 *                      example: /5/5/1073493824/event
 *                  info:
 *                      type: object
 *                      required:
 *                      properties:
 *                          Group:
 *                              type: number
 *                              example: 2
 *                          Event_id:
 *                              type: number
 *                              example: 22
 *                          Key_id:
 *                              type: number
 *                              example: 10
 *                          DateTm:
 *                              type: number
 *                              example: 1599904641
 *                          Stp_idx:
 *                              type: number
 *                              example: 1
 *          responses:
 *              '201':
 *                  description: A notification object
 *              '409':
 *                  description: Conflict
 *              '422':
 *                  description: Wrong data
 */

    public static async post (ctx: DefaultContext) {
        try {
                const data = ctx.request.body
                MQTTBroker.publishMessage(data.topic, JSON.stringify(data))
                ctx.body = { message: 'succsess' }
            } catch (error) {
            console.log(333, error)

            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
