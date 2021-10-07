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
import { cardholderPresense } from '../../enums/cardholderPresense.enum'
import { Cardholder } from './Cardholder'
import { Package } from './Package'

const clickhouse_server: string = process.env.CLICKHOUSE_SERVER ? process.env.CLICKHOUSE_SERVER : 'http://localhost:4143'
const getEventLogsUrl = `${clickhouse_server}/eventLog`
const getEventStatisticUrl = `${clickhouse_server}/eventStatistic`

export class EventLog extends BaseClass {
    public static resource: boolean = true
    public static serviceResource: boolean = true

    public static async get (user: any, data?: any) {
        let url = `${getEventLogsUrl}?company=${user.company ? user.company : 0}`

        if (user.companyData && user.companyData.package) {
            const package_data = await Package.createQueryBuilder('package')
                .where('id = :id', { id: user.companyData.package })
                .withDeleted()
                .getOne() as Package

            if (package_data.extra_settings) {
                const extra_settings: any = JSON.parse(package_data.extra_settings)
                if (extra_settings.resources[this.name]) {
                    url += `&resource_limit=${extra_settings.resources[this.name]}`
                }
            }
        }

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

    public static getEventStatistic (user: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            let url = `${getEventStatisticUrl}?company=${user.company ? user.company : 0}`

            if (user.companyData && user.companyData.package) {
                const package_data = await Package.createQueryBuilder('package')
                    .where('id = :id', { id: user.companyData.package })
                    .withDeleted()
                    .getOne() as Package

                if (package_data.extra_settings) {
                    const extra_settings: any = JSON.parse(package_data.extra_settings)
                    if (extra_settings.resources[this.name]) {
                        url += `&resource_limit=${extra_settings.resources[this.name]}`
                    }
                }
            }

            getRequest(url)
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

    public static async create (event: any) {
        MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(event))
        new SendSocketMessage(socketChannels.DASHBOARD_ACTIVITY, event.data, event.data.company)

        if (event.data.event_type === eventTypes.SYSTEM) {
            let door_state
            if (event.data.event_type.event_id === 116) {
                door_state = accessPointDoorState.CLOSED
            } else if (event.data.event_type.event_id === 117) {
                door_state = accessPointDoorState.OPEN
            }
            if (door_state) {
                AccessPoint.updateItem({ id: event.data.access_point, door_state: door_state } as AccessPoint)
            }
        }

        if (event.data.access_point) {
            const last_activity = event.data
            AccessPoint.updateItem({ id: event.data.access_point, last_activity: last_activity } as AccessPoint)
        }

        if (event.data.event_type === eventTypes.CARDHOLDER_ALARM || event.data.event_type === eventTypes.SYSTEM_ALARM) {
            const notification = await Notification.addItem(event.data as Notification)
            new SendSocketMessage(socketChannels.NOTIFICATION, notification, event.data.company)
        }

        if (event.data.event_type === eventTypes.CARDHOLDER) {
            new SendSocketMessage(socketChannels.DASHBOARD_MONITOR, event.data, event.data.company)
            if (event.data.cardholder) {
                const cardholder = Object.assign({}, event.data.cardholder)
                if (event.data.event_type.event_id === 25) {
                    cardholder.presense = cardholderPresense.PRESENSE
                } else if (event.data.event_type.event_id === 26) {
                    cardholder.presense = cardholderPresense.ABSENT_BY_REASON
                }
                if (event.data.cardholder !== cardholder.presense) {
                    await Cardholder.save(cardholder)
                }
            }
        }
    }
}
