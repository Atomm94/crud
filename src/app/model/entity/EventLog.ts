import { BaseClass } from './BaseClass'
import { getRequest } from '../../services/requestUtil'
import MQTTBroker from '../../mqtt/mqtt'
import { SendTopics } from '../../mqtt/Topics'
import { Notification } from './Notification'
// import eventList from '../../model/entity/eventList.json'
import { socketChannels } from '../../enums/socketChannels.enum'
import { eventTypes } from '../../enums/eventTypes.enum'
import { accessPointDoorState } from '../../enums/accessPointDoorState.enum'
import { AccessPoint } from './AccessPoint'
import SendSocketMessage from '../../mqtt/SendSocketMessage'

const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getEventLogsUrl = `${clickhouse_server}/eventLog`
const getEventStatisticUrl = `${clickhouse_server}/eventStatistic`

export class EventLog extends BaseClass {
    public static resource: boolean = true

    public static get (user: any, data?: any) {
        let url = `${getEventLogsUrl}?company=${user.company ? user.company : 0}&limit=100`// limit HARDCODE!!
        if (data) {
            if (data.page) url += `&page=${data.page}`
            if (data.page_items_count) url += `&page_items_count=${data.page_items_count}`

            if (data.start_from) url += `&start_from=${data.start_from}`
            if (data.start_to) url += `&start_to=${data.start_to}`
            if (data.access_points) url += `&access_points=${data.access_points}`
            if (data.cardholders) url += `&cardholders=${data.cardholders}`
            if (data.events) url += `&events=${data.events}`
        }
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject) => {
            getRequest(url)
                .then((res: string) => {
                    resolve(res)
                })
                .catch(rej => {
                    reject(rej)
                })
        })
    }

    public static getEventStatistic (user: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject) => {
            getRequest(`${getEventStatisticUrl}?company=${user.company ? user.company : 0}&limit=100`) // limit HARDCODE!!
                .then((res: string) => {
                    resolve(res)
                })
                .catch(rej => {
                    reject(rej)
                })
        })
    }

    public static async create (event: any) {
        MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(event))
        new SendSocketMessage(socketChannels.DASHBOARD_ACTIVITY, event.data)

        if (event.data.event_type === eventTypes.SYSTEM) {
            let door_state
            if (event.data.event_type.event_id === 116) {
                door_state = accessPointDoorState.CLOSED
            } else if (event.data.event_type.event_id === 117) {
                door_state = accessPointDoorState.OPEN
            }
            if (door_state) {
                AccessPoint.updateItem({ id: event.data.access_point_id, door_state: door_state } as AccessPoint)
            }
        }

        if (event.data.access_point_id) {
            const last_activity = event.data
            AccessPoint.updateItem({ id: event.data.access_point_id, last_activity: last_activity } as AccessPoint)
        }

        if (event.data.event_type === eventTypes.CARDHOLDER_ALARM || event.data.event_type === eventTypes.SYSTEM_ALARM) {
            const notification = await Notification.addItem(event.data as Notification)
            new SendSocketMessage(socketChannels.NOTIFICATION, notification)
        }

        if (event.data.event_type === eventTypes.CARDHOLDER) {
            new SendSocketMessage(socketChannels.DASHBOARD_MONITOR, event.data)
        }
    }
}
