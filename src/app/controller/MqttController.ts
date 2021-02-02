import { DefaultContext } from 'koa'
import { Company } from '../model/entity'
import MQTTBroker from '../mqtt/mqtt'
import { TopicCodes } from '../mqtt/Topics'
import { OperatorType } from '../mqtt/Operators'

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
                const send_message = {
                    operator: OperatorType.REGISTRATION,
                    location: location
                }
                MQTTBroker.publishMessage(TopicCodes.SUB_TOPIC, JSON.stringify(send_message))
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
