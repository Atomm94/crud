import { DefaultContext } from 'koa'
import { IMqttCrudMessaging } from '../Interfaces/messaging.interface'
import { AccessPoint, Acu, Cardholder, Company } from '../model/entity'
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
            let event_logs: any = await EventLog.get(user, req_data)
            const event_logs_data = (event_logs.data) ? event_logs.data : event_logs

            const cardholder_ids = event_logs_data.filter((event_log: any) => event_log.cardholder_id).map((event_log: any) => event_log.cardholder_id)

            if (cardholder_ids.length) {
                const delete_cardholders: any = await Cardholder.createQueryBuilder('cardholder')
                    .where('id in (:...ids)', { ids: cardholder_ids })
                    .andWhere('delete_date is not null')
                    .withDeleted()
                    .getMany()

                if (delete_cardholders.length) {
                    const delete_cardholder_ids = delete_cardholders.map((cardholder: Cardholder) => cardholder.id)
                    for (const event_log of event_logs_data) {
                        if (delete_cardholder_ids.includes(event_log.cardholder_id)) {
                            const event_log_cardholder = JSON.parse(event_log.cardholder)
                            event_log_cardholder.last_name = (event_log_cardholder.last_name) ? `${event_log_cardholder.last_name}(deleted)` : '(deleted)'
                            event_log.cardholder = JSON.stringify(event_log_cardholder)
                        }
                    }
                }
            }

            if (event_logs.data) {
                event_logs.data = event_logs_data
            } else {
                event_logs = event_logs_data
            }
            ctx.body = event_logs
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    public static createEventFromDevice (message: IMqttCrudMessaging) {
        const message_data = message.info
        const acu = Acu.findOneOrFail({ serial_number: message.device_id, company: message.company })
        const access_point = AccessPoint.findOne({ where: { id: message_data.Ctp_idx, company: message.company }, relations: ['access_point_zones'] })
        const credential = Credential.findOne({
            where: { id: message_data.Key_id, company: message.company },
            relations: ['cardholders', 'cardholders.access_rights', 'cardholders.car_infos', 'cardholders.limitations', 'cardholders.cardholder_groups']
        })

        Promise.all([acu, access_point, credential]).then(async (data: any) => {
            const acu: Acu = data[0]
            if (acu) {
                const access_point: AccessPoint = data[1]
                const credential: Credential = data[2]
                const companies_that_send_events = [message.company]
                if (credential && credential.company !== message.company) { // that means its event for partition
                    companies_that_send_events.push(credential.company)
                } else if (access_point) {
                    const partitions = await Company.find({ where: { partition_parent_id: message.company } })
                    for (const partition of partitions) {
                        if (partition.base_access_points) {
                            const base_access_points = JSON.parse(partition.base_access_points)
                            if (base_access_points.includes(access_point.id)) {
                                companies_that_send_events.push(partition.id)
                            }
                        }
                    }
                }

                for (const company_that_send_events of companies_that_send_events) {
                    const eventData: any = {
                        operator: OperatorType.EVENT_LOG,
                        data: {
                            company: company_that_send_events,
                            date: message_data.time,
                            direction: message_data.direction
                        }
                    }
                    if (credential) {
                        eventData.data.credential = _.pick(credential, ['id', 'type', 'code'])
                        eventData.data.cardholder_id = credential.cardholders ? credential.cardholders.id : null
                        eventData.data.cardholder = credential.cardholders ? _.pick(credential.cardholders, ['id', 'email', 'phone', 'avatar', 'first_name', 'last_name', 'family_name', 'company_name', 'status', 'presense', 'vip', 'car_infos', 'limitations', 'access_rights', 'cardholder_groups']) : null
                        eventData.data.access_right = credential.cardholders.access_rights ? _.pick(credential.cardholders.access_rights, ['id', 'name']) : null
                    }
                    if (access_point) {
                        eventData.data.access_point = access_point.id
                        eventData.data.access_points = _.pick(access_point, ['id', 'name', 'access_point_zone', 'access_point_zones'])
                        if (eventData.data.access_points.access_point_zones) {
                            eventData.data.access_points.access_point_zones = _.pick(eventData.data.access_points.access_point_zones, ['id', 'name'])
                        }
                    }
                    const EventList: any = eventList

                    if (EventList[message_data.Group]) {
                        eventData.data.event_type = EventList[message_data.Group].name
                        if (EventList[message_data.Group].events[message_data.Event_id]) {
                            eventData.data.event_group_id = message_data.Group
                            eventData.data.event_id = message_data.Event_id
                            eventData.data.event = EventList[message_data.Group].events[message_data.Event_id].event
                            eventData.data.event_source = EventList[message_data.Group].events[message_data.Event_id].source_entity
                            eventData.data.result = EventList[message_data.Group].events[message_data.Event_id].description
                            eventData.data.Key_HEX = message_data.Key_HEX
                        }
                    }
                    EventLog.create(eventData)
                }
            }
        }).catch((error) => {
            console.log(error)
        })
    }
}
