import { BaseClass } from './BaseClass'
import { getRequest } from '../../services/requestUtil'
import MQTTBroker from '../../mqtt/mqtt'
import { SendTopics } from '../../mqtt/Topics'
const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getEventLogsUrl = `${clickhouse_server}/eventLog`

export class EventLog extends BaseClass {
    public static resource: boolean = true

    public static get (user: any, data?: any) {
        let url = `${getEventLogsUrl}?company=${user.company ? user.company : 0}&limit=100`// limit HARDCODE!!
        if (data) {
            url += `&start_from=${data.start_from}`
            url += `&start_to=${data.start_to}`
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

    public static create (event: any) {
        MQTTBroker.publishMessage(SendTopics.CRUD_LOG, JSON.stringify(event))
    }
}
