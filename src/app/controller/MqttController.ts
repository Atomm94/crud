import { DefaultContext } from 'koa'
import { Company } from '../model/entity'
// import MQTTBroker from '../mqtt/mqtt'
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
                //     operator: 'accept-ack',
                //     session_id: '0',
                //     message_id: '0',
                //     info: 'none',
                //     result:
                //     {
                //         errorNo: 0,
                //         description: 'ok',
                //         time: 1599904641
                //     }
                // }

                // MQTTBroker.publishMessage('587123122/1/Registration/12/Operate/Ack', JSON.stringify(send_message1))

                /// ///////////////// login_ack message
                // const login_ack = {
                //     operator: 'login-Ack',
                //     sessionId: 2222222222,
                //     messageId: 1111111111,
                //     result:
                //     {
                //         errorNo: 0,
                //         description: 'Error',
                //         time: 159990464
                //     }
                // }
                // MQTTBroker.publishMessage('587123122/5/Registration/123456789/Operate/Ack', JSON.stringify(login_ack))

                /// ////////////// logout_ack message
                // const logout_ack = {
                //     operator: 'logout-Ack',
                //     session_Id: 2222222222,
                //     message_Id: 1111111111,
                //     info: 'none',
                //     result:
                //                 {
                //                errorNo: 0,
                //                description: 'ok',
                //                time: 1599904641
                //                 }
                //     }
                // MQTTBroker.publishMessage('587123122/5/Registration/123456789/Operate/Ack', JSON.stringify(logout_ack))

                /// ////////////// setpass_ack message

                // const setPass_ack = {
                //     operator: 'GetMQTTSettings',
                //     session_Id: 2222222222,
                //     message_Id: 1111111111,
                //     info: 'none',
                //     result:
                //                 {
                //                errorNo: 0,
                //                description: 'ok',
                //                time: 1599904641
                //                 }
                //     }
                // MQTTBroker.publishMessage('587123122/5/Registration/123456789/Operate/Ack', JSON.stringify(setPass_ack))

                 /// /////////// deviceGetMqttSettingsAck message

                // const getPass_ack = {
                //     operator: 'GetMQTTSettings-Ack',
                //     session_Id: '1111111111',
                //     message_Id: '3333333333',
                //     info:
                //     {
                //         BrokerAdr: 'lumiring.msg.th',
                //         BrokerPort: 3285,
                //         ClientID: '101FRE1111325665454RETV123355',
                //         Use_SSL: false,
                //         User_Name: 'TR2584567452121TFD',
                //         User_Pass: 'ASTR565VFDF8787fdtrtJ76p',
                //         Location: '55884455/main_perimeter_group',
                //         DeviceID: '123456789',
                //         'use_ enryption': false
                //     },
                //     result:
                //     {
                //         errorNo: 0,
                //         time: 1599904641
                //     }
                // }
                // MQTTBroker.publishMessage('587123122/5/Registration/123456789/Operate/Ack', JSON.stringify(getPass_ack))

                 /// /////////// deviceGetStatusACU-ack message

            //     const getStatusACU_ack = {
            //         operator: 'GetStatusACU-ack',
            //         session_Id: '1111111111',
            //         message_Id: '3333333333',
            //         info:
            //         {
            //             supply_voltage: '12.5',
            //             connection_type: 'WiFi',
            //             connection_mod: 'DHCP',
            //             current_ip: '192.168.1.125',
            //             wifi_sign_strength: -56,
            //             connected_to: 'Office245',
            //                 device_id: '123456789',
            //   device_serial: '123456789',
            //   model: 'LMF001',
            //   firmware_ver: '1.0028',
            //   rev: '0.1',
            //   state: 'registered',
            //   name: '1254874589',
            //   locations: '55884455/registration',
            //   note: 'main entrance',
            //   keys_count: 1825,
            //   shedules_count: 18,
            //   control_points_count: 1,
            //   mem_free_heap: 506024,
            //             free_space: 1208024,
            //             Control_Points: 1,
            //             Events_count: 1500,
            //             Inputs: 8,
            //             Outputs: 4,
            //             P_Outputs: 1,
            //   gmt: -3
            //   },
            //         result:
            //         {
            //             errorNo: 0,
            //             time: 1599904641
            //         }
            //     }
            //     MQTTBroker.publishMessage('587123122/5/Registration/123456789/Operate/Ack', JSON.stringify(getStatusACU_ack))
            }
} catch (error) {
    ctx.status = error.status || 400
    ctx.body = error
}
return ctx.body
    }
}
