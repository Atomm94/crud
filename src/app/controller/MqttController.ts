import { DefaultContext } from 'koa'
import { IsNull, Not } from 'typeorm'
import { Admin } from '../model/entity/Admin'
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
            const id = +ctx.params.id
            const where = { id: id, company: Not(IsNull()) }
            const account: any = await Admin.getItem(where)
            ctx.body = {
                Location: `${id}/${account.company}`
            }
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
