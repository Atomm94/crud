import { BaseClass } from './BaseClass'
import { getRequest } from '../../services/requestUtil'
const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getUserLogsUrl = `${clickhouse_server}/userLog`

export class UserLog extends BaseClass {
    public static resource: boolean = true
    public static serviceResource: boolean = true

    public static get (user: any, data?: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject) => {
            let url = `${getUserLogsUrl}?company=${user.company ? user.company : 0}&limit=100`// limit HARDCODE!!
            if (data) {
                if (data.page) url += `&page=${data.page}`
                if (data.page_items_count) url += `&page_items_count=${data.page_items_count}`

                if (data.start_from) url += `&start_from=${data.start_from}`
                if (data.start_to) url += `&start_to=${data.start_to}`
                if (data.access_points) url += `&access_points=${data.access_points}`
                if (data.cardholders) url += `&cardholders=${data.cardholders}`
                if (data.events) url += `&events=${data.events}`
            }
            getRequest(url) // limit HARDCODE!!
                .then((res: string) => {
                    resolve(res)
                })
                .catch(rej => {
                    let reject_data
                    try {
                        reject_data = JSON.parse(rej)
                    } catch (error) {
                    }

                    if (reject_data && reject_data.code && reject_data.code === 60) {
                        resolve([])
                    } else {
                        reject(rej)
                    }
                })
        })
    }
}
