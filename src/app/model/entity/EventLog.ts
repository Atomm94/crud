import { BaseClass } from './BaseClass'
import { getRequest } from '../../services/requestUtil'
import MQTTBroker from '../../mqtt/mqtt'
import { SendTopics } from '../../mqtt/Topics'
const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getEventLogsUrl = `${clickhouse_server}/eventLog`
const getEventStatisticUrl = `${clickhouse_server}/eventStatistic`
export class EventLog extends BaseClass {
    public static resource: boolean = true

    public static get (user: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject) => {
            getRequest(`${getEventLogsUrl}?company=${user.company ? user.company : 0}&limit=100`) // limit HARDCODE!!
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

    public static create (event: any) {
        MQTTBroker.publishMessage(SendTopics.CRUD_LOG, JSON.stringify(event))
    }
}
