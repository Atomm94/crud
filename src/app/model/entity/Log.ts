import { BaseClass } from './BaseClass'
import { getRequest } from '../../services/requestUtil'
const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getUserLogsUrl = `${clickhouse_server}/userLog`
const getEventLogsUrl = `${clickhouse_server}/eventLog`

export class Log extends BaseClass {
    public static getUserLogs (user: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            await getRequest(`${getUserLogsUrl}?company=${user.company ? user.company : 0}&limit=100`) // limit HARDCODE!!
                .then((res: string) => {
                    resolve(res)
                })
                .catch(rej => {
                    reject(rej)
                })
        })
    }

    public static getEventLogs (user: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            await getRequest(`${getEventLogsUrl}?company=${user.company ? user.company : 0}&limit=100`) // limit HARDCODE!!
                .then((res: string) => {
                    resolve(res)
                })
                .catch(rej => {
                    reject(rej)
                })
        })
    }
}
