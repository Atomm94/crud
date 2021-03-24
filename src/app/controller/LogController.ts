import { DefaultContext } from 'koa'
import { IMqttCrudMessaging } from '../Interfaces/messaging.interface'
import { AccessPoint, Acu } from '../model/entity'
import { Credential } from '../model/entity/Credential'
import { EventLog } from '../model/entity/EventLog'
import { UserLog } from '../model/entity/UserLog'
import eventList from '../model/entity/eventList.json'
import _ from 'lodash'
import { OperatorType } from '../mqtt/Operators'

export default class LogController {
    /**
     *
     * @swagger
     * /userLog:
     *      get:
     *          tags:
     *              - Log
     *          summary: Return Logs
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of Logs
     *              '401':
     *                  description: Unauthorized
     */
    public static async getUserLogs (ctx: DefaultContext) {
        try {
            const user = ctx.user
            const req_data = ctx.query
            ctx.body = await UserLog.get(user, req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /eventLog:
     *      get:
     *          tags:
     *              - Log
     *          summary: Return Logs
     *          parameters:
     *              - in: header
     *                name: Authorization
     *                required: true
     *                description: Authentication token
     *                schema:
     *                    type: string
     *          responses:
     *              '200':
     *                  description: Array of Logs
     *              '401':
     *                  description: Unauthorized
     */
    public static async getEventLogs (ctx: DefaultContext) {
        try {
            const user = ctx.user
            const req_data = ctx.query
            ctx.body = await EventLog.get(user, req_data)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    public static createEventFromDevice (message: IMqttCrudMessaging) {
        const message_data = message.info
        const acu = Acu.findOneOrFail({ serial_number: message.device_id, company: message.company })
        const access_point = AccessPoint.findOne(message_data.Stp_idx)
        const credential = Credential.findOne({ where: { id: message_data.Key_id }, relations: ['cardholders', 'cardholders.access_rights', 'cardholders.antipass_backs', 'cardholders.car_infos', 'cardholders.limitations', 'cardholders.cardholder_groups'] })

        Promise.all([acu, access_point, credential]).then((data: any) => {
            const eventData: any = { operator: OperatorType.EVENT_LOG, data: { company: message.company, date: message_data.DateTm } }
            const acu: Acu = data[0]
            if (acu) {
                const access_point: AccessPoint = data[1]
                const credential: Credential = data[2]
                if (credential) {
                    eventData.data.credential = _.pick(credential, ['id', 'type', 'code'])
                    eventData.data.cardholder_id = credential.cardholders ? credential.cardholders.id : null
                    eventData.data.cardholder = credential.cardholders ? _.pick(credential.cardholders, ['id', 'email', 'phone', 'avatar', 'first_name', 'last_name', 'family_name', 'company_name', 'status', 'car_infos', 'antipass_backs', 'limitations', 'access_rights', 'cardholder_groups']) : null
                    eventData.data.access_right = credential.cardholders.access_rights ? _.pick(credential.cardholders.access_rights, ['id', 'name']) : null
                }
                if (access_point) {
                    eventData.data.access_point_id = access_point.id
                    eventData.data.access_point = _.pick(access_point, ['id', 'name'])
                }
                const EventList: any = eventList

                if (EventList[message_data.Group]) {
                    eventData.data.event_type = EventList[message_data.Group].name
                    if (EventList[message_data.Group].events[message_data.Event_id]) {
                        eventData.data.event_id = message_data.Event_id
                        eventData.data.event = EventList[message_data.Group].events[message_data.Event_id].event
                        eventData.data.event_source = EventList[message_data.Group].events[message_data.Event_id].source_entity
                        eventData.data.result = EventList[message_data.Group].events[message_data.Event_id].description
                    }
                }
            }
            EventLog.create(eventData)
        }).catch((error) => {
            console.log(error)
        })
    }
}
