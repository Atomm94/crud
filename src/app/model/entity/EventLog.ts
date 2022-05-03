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
import { AutoTaskSchedule } from '.'
import { In } from 'typeorm'
import CtpController from '../../controller/Hardware/CtpController'
import DeviceController from '../../controller/Hardware/DeviceController'
import CardKeyController from '../../controller/Hardware/CardKeyController'
import { OperatorType } from '../../mqtt/Operators'
import { Company } from './Company'
import { Credential } from './Credential'

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
            if (data.access_points) url += `&access_points=${JSON.stringify(data.access_points)}`
            if (data.cardholders) url += `&cardholders=${JSON.stringify(data.cardholders)}`
            if (data.events) url += `&events=${JSON.stringify(data.events)}`
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

            const event_group_id = Number(event.data.event_group_id)
            const event_id = Number(event.data.event_id)
            if (event_id === 16) {
                // const credential: any = await Credential.findOne({ where: { access_point: event.data.access_point, code: IsNull() }, relations: ['cardholders', 'cardholders.access_rights', 'cardholders.access_rights.access_rules'] })
                const credential: any = await Credential.createQueryBuilder('credential')
                    .leftJoinAndSelect('credential.cardholders', 'cardholder')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('access_right.access_rules', 'access_rule', 'access_rule.delete_date is null')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    .where('credential.access_point', event.data.access_point)
                    .andWhere('credential.code is null')
                    .getOne()

                if (credential) {
                    console.log('🚀 ~ file: EventLog.ts ~ line 142 ~ EventLog ~ create ~ cardholder', credential)
                    credential.code = event.data.Key_HEX
                    await credential.save()
                    new SendSocketMessage(socketChannels.CREDENTIAL_AUTOMAT_MODE, credential, credential.company)

                    const parent_company = await Company.findOneOrFail({ where: { id: event.data.company } })
                    const location = `${parent_company.account}/${parent_company.id}`
                    const cardholder = credential.cardholders
                    delete credential.cardholders
                    cardholder.credentials = [credential]
                    CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, credential.company, null, null, [cardholder], null)
                }
            }

            if (event_group_id && event_id) {
                if (
                    (event_group_id === 0 && [120].includes(event_id)) ||
                    (event_group_id === 1 && [4, 6, 8, 19, 20, 21, 118, 119].includes(event_id)) ||
                    (event_group_id === 2 && [24].includes(event_id)) ||
                    (event_group_id === 3 && [1, 2, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17].includes(event_id))
                ) {
                    const auto_task = await AutoTaskSchedule.findOne({ where: { access_point: event.data.access_point } })
                    if (auto_task && auto_task.reaction_access_points) {
                        console.log(auto_task)
                        const access_points = await AccessPoint.find({ where: { id: In(JSON.parse(auto_task.reaction_access_points)) }, relations: ['acus', 'companies'] })

                        for (const access_point of access_points) {
                            const location = `${access_point.companies.account}/${access_point.company}`
                            if (auto_task.reaction !== 3) {
                                const data = {
                                    id: access_point.id,
                                    work_mode: auto_task.reaction,
                                    type: access_point.type
                                }
                                CtpController.setCtp(access_point.type, location, access_point.acus.serial_number, data, null, access_point.acus.session_id)
                            } else {
                                const data = {
                                    access_point: access_point.id
                                }
                                DeviceController.resetApb(location, access_point.acus.serial_number, data, null, access_point.acus.session_id)
                            }
                        }
                    }
                }
            }
        }

        if (event.data.event_type === eventTypes.CARDHOLDER_ALARM || event.data.event_type === eventTypes.SYSTEM_ALARM) {
            const notification: any = await Notification.addItem(event.data as Notification)
            notification.access_points = event.data.access_points
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
