import { BaseClass } from './BaseClass'
import { getRequest } from '../../services/requestUtil'
const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getEventLogsUrl = `${clickhouse_server}/eventLog`

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
}
