import { DefaultContext } from 'koa'
import { IMqttCrudMessaging } from '../Interfaces/messaging.interface'
import { AccessPoint, Acu, Cardholder, Company } from '../model/entity'
import { Credential } from '../model/entity/Credential'
import { EventLog } from '../model/entity/EventLog'
import { UserLog } from '../model/entity/UserLog'
import eventList from '../model/entity/eventList.json'
import _ from 'lodash'
import { OperatorType } from '../mqtt/Operators'
import { RedisClass } from '../../component/redis'
import { checkCacheKey } from '../enums/checkCacheKey.enum'

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

    public static async sendEventsLog (message: IMqttCrudMessaging) {
        const message_data = message.info

        const Events: any[] = message.info.Events
        let check_acu_write = false
        let check_access_point_write = false
        let check_credential_write = false
        let acu_data = await this.cacheCheck(message.company, message.device_id, checkCacheKey.ACU)
        if (!acu_data) {
            check_acu_write = true
            acu_data = Acu.findOne({ where: { serial_number: message.device_id, company: message.company } })
        } else if (acu_data === '{}') {
            acu_data = null
        }

        const eventsData: any = {
            operator: OperatorType.GET_EVENTS_LOGS
        }

        eventsData.events = await Promise.all(Events.map(async event => {
            event.Ctp_idx = +event.Ctp_idx
            event.Key_id = +event.Key_id

            let access_point = await this.cacheCheck(message.company, message_data.Ctp_idx, checkCacheKey.ACCESS_POINT)
            if (!access_point) {
                check_access_point_write = true
                if (event.Ctp_idx) {
                    access_point = AccessPoint.createQueryBuilder('access_point')
                        .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                        .leftJoinAndSelect('access_point.camera_sets', 'camera_set', 'camera_set.delete_date is null')
                        .leftJoinAndSelect('camera_set.camera_set_cameras', 'camera_set_camera')
                        .leftJoinAndSelect('camera_set_camera.cameras', 'camera', 'camera.delete_date is null')
                        .where(`access_point.id = '${event.Ctp_idx}'`)
                        .andWhere(`access_point.company = '${message.company}'`)
                        .getOne()
                }
            } else if (access_point === '{}') {
                access_point = null
            }

            let credential = await this.cacheCheck(message.company, message_data.Key_id ? message_data.Key_id : null, checkCacheKey.CARDHOLDER)
            if (!credential) {
                check_credential_write = true
                if (event.Key_id) {
                    credential = Credential.createQueryBuilder('credential')
                        .leftJoinAndSelect('credential.cardholders', 'cardholder')
                        .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                        .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                        .leftJoinAndSelect('cardholder.limitations', 'limitation')
                        .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                        .where(`credential.id = ${event.Key_id}`)
                        .andWhere(`credential.company = ${message.company}`)
                        .getOne()
                }
            } else if (credential === '{}') {
                credential = null
            }

            console.log('access_point')
            console.log(access_point)
            console.log('credential')
            console.log(credential)

            return Promise.all([acu_data, access_point, credential]).then(async (data: any) => {
                const acu: any = data[0]
                if (check_acu_write) await this.cacheCheck(message.company, message.device_id, checkCacheKey.ACU, acu || {})
                const time_zone = acu?.time ? JSON.parse(acu.time).time_zone : null
                if (acu) {
                    const access_point: AccessPoint = data[1]
                    if (check_access_point_write) await this.cacheCheck(message.company, event.Ctp_idx, checkCacheKey.ACCESS_POINT, access_point || {})
                    const credential: Credential = data[2]
                    if (check_credential_write) await this.cacheCheck(message.company, event.Key_id ? event.Key_id : null, checkCacheKey.CARDHOLDER, credential || {})
                    const companies_that_send_events = [message.company]
                    if (credential && credential.company !== message.company) {
                        companies_that_send_events.push(credential.company)
                    } else if (access_point) {
                        const partitions = await Company.createQueryBuilder('company')
                            .where(`company.partition_parent_id = ${message.company}`)
                            .andWhere('company.delete_date is null')
                            .cache(`company:${message.company}`, 24 * 60 * 60 * 1000)
                            .getMany()

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
                        const data: any = {
                            company: company_that_send_events,
                            date: event.time,
                            gmt: event.gmt,
                            time_zone: time_zone,
                            direction: event.direction
                        }
                        if (credential) {
                            data.credential = _.pick(credential, ['id', 'type', 'code'])
                            data.cardholder_id = credential.cardholders ? credential.cardholders.id : null
                            data.cardholder = credential.cardholders ? _.pick(credential.cardholders, ['id', 'email', 'phone', 'avatar', 'first_name', 'last_name', 'family_name', 'company_name', 'status', 'presense', 'vip', 'car_infos', 'limitations', 'access_rights', 'cardholder_groups']) : null
                            data.access_right = credential.cardholders.access_rights ? _.pick(credential.cardholders.access_rights, ['id', 'name']) : null
                        }
                        if (access_point) {
                            data.access_point = access_point.id
                            data.access_point_name = access_point.name
                            const access_point_data: any = _.pick(access_point, ['id', 'name', 'access_point_zone', 'access_point_zones'])
                            if (access_point_data.access_point_zones) {
                                access_point_data.access_point_zones = _.pick(access_point_data.access_point_zones, ['id', 'name'])
                            }
                            if (access_point.camera_sets && access_point.camera_sets.length && event.time) {
                                const camera_set = access_point.camera_sets[0]
                                const cameras = []
                                for (const camera_set_camera of camera_set.camera_set_cameras) {
                                    if (camera_set_camera.cameras) {
                                        cameras.push({ id: camera_set_camera.cameras.id, main: camera_set_camera.main, name: camera_set_camera.cameras.name })
                                    }
                                }
                                access_point_data.camera_set = {
                                    before_event_tms: event.time - camera_set.before_event,
                                    after_event_tms: event.time + camera_set.after_event,
                                    cameras
                                }
                            } else {
                                access_point_data.camera_set = null
                            }
                            data.access_points = access_point_data
                        }
                        if ('gmt' in data) {
                            if (data.access_points) {
                                data.access_points.gmt = data.gmt
                                data.access_points.time_zone = time_zone
                            } else {
                               data.access_points = {
                                    gmt: data.gmt,
                                    time_zone: time_zone
                                }
                            }
                        }
                        const EventList: any = eventList

                        if (EventList[event.Group]) {
                            data.event_type = EventList[event.Group].name
                            if (EventList[event.Group].events[event.Event_id]) {
                                data.event = EventList[event.Group].events[event.Event_id].event
                                data.event_source = EventList[event.Group].events[event.Event_id].source_entity
                                data.result = EventList[event.Group].events[event.Event_id].description
                            } else {
                                data.event = 'Unknown Event_id'
                                data.event_source = 'Unknown SourceEntity'
                                data.result = 'Unknown Description'
                            }
                        } else {
                            data.event_type = 'Unknown Group'
                            data.event = 'Unknown Event_id'
                            data.event_source = 'Unknown SourceEntity'
                            data.result = 'Unknown Description'
                        }
                        data.event_group_id = event.Group
                        data.event_id = event.Event_id
                        data.Key_HEX = event.Key_HEX
                        data.credential = { type: event.Kind_key, code: event.Key_HEX }
                        // eventData.data.cardholder_id = message_data.key_id
                        // eventData.data.direction = (event.Direction === 1) ? 'Exit' : 'Entry'
                        data.direction = (event.Direction === 1) ? 1 : 0

                        console.log('daaaaaaaaaaaaaaaaaataaaaaaaaaaaaaaa')
                        console.log(data)

                        return data
                    }
               }
            }).catch(() => {
            // console.log(error)
            })
        }))

        EventLog.createTest(eventsData)
    }

    public static async createEventFromDevice (message: IMqttCrudMessaging) {
        const message_data = message.info
        message_data.Ctp_idx = +message_data.Ctp_idx
        message_data.Key_id = +message_data.Key_id
        let check_acu_write = false
        let acu_data = await this.cacheCheck(message.company, message.device_id, checkCacheKey.ACU)
        if (!acu_data) {
            check_acu_write = true
            acu_data = Acu.findOne({ where: { serial_number: message.device_id, company: message.company } })
        } else if (acu_data === '{}') {
            acu_data = null
        }

        // const access_point = AccessPoint.findOne({ where: { id: message_data.Ctp_idx, company: message.company }, relations: ['access_point_zones'] })
        let access_point = await this.cacheCheck(message.company, message_data.Ctp_idx, checkCacheKey.ACCESS_POINT)
        let check_access_point_write = false
        let check_credential_write = false
        if (!access_point) {
            check_access_point_write = true
            if (message_data.Ctp_idx) {
                access_point = AccessPoint.createQueryBuilder('access_point')
                    .leftJoinAndSelect('access_point.access_point_zones', 'access_point_zone', 'access_point_zone.delete_date is null')
                    .leftJoinAndSelect('access_point.camera_sets', 'camera_set', 'camera_set.delete_date is null')
                    .leftJoinAndSelect('camera_set.camera_set_cameras', 'camera_set_camera')
                    .leftJoinAndSelect('camera_set_camera.cameras', 'camera', 'camera.delete_date is null')
                    .where(`access_point.id = '${message_data.Ctp_idx}'`)
                    .andWhere(`access_point.company = '${message.company}'`)
                    .getOne()
            }
        } else if (access_point === '{}') {
            access_point = null
        }

        // const credential = Credential.findOne({
        //     where: { id: message_data.Key_id || 0, company: message.company },
        //     relations: ['cardholders', 'cardholders.access_rights', 'cardholders.car_infos', 'cardholders.limitations', 'cardholders.cardholder_groups']
        // })

        let credential = await this.cacheCheck(message.company, message_data.Key_id ? message_data.Key_id : null, checkCacheKey.CARDHOLDER)
        if (!credential) {
            check_credential_write = true
            if (message_data.Key_id) {
                credential = Credential.createQueryBuilder('credential')
                    .leftJoinAndSelect('credential.cardholders', 'cardholder')
                    .leftJoinAndSelect('cardholder.access_rights', 'access_right')
                    .leftJoinAndSelect('cardholder.car_infos', 'car_info')
                    .leftJoinAndSelect('cardholder.limitations', 'limitation')
                    .leftJoinAndSelect('cardholder.cardholder_groups', 'cardholder_group')
                    .where(`credential.id = ${message_data.Key_id}`)
                    .andWhere(`credential.company = ${message.company}`)
                    .getOne()
            }
        } else if (credential === '{}') {
            credential = null
        }

        Promise.all([acu_data, access_point, credential]).then(async (data: any) => {
            const acu: any = data[0]
            if (check_acu_write) await this.cacheCheck(message.company, message.device_id, checkCacheKey.ACU, acu || {})
            const time_zone = acu?.time ? JSON.parse(acu.time).time_zone : null
            if (acu) {
                const access_point: AccessPoint = data[1]
                if (check_access_point_write) await this.cacheCheck(message.company, message_data.Ctp_idx, checkCacheKey.ACCESS_POINT, access_point || {})
                const credential: Credential = data[2]
                if (check_credential_write) await this.cacheCheck(message.company, message_data.Key_id ? message_data.Key_id : null, checkCacheKey.CARDHOLDER, credential || {})
                const companies_that_send_events = [message.company]
                if (credential && credential.company !== message.company) { // that means its event for partition
                    companies_that_send_events.push(credential.company)
                } else if (access_point) {
                    // TO DO: check if the access point is in the partition --SET CACHE
                    // const partitions = await Company.find({ where: { partition_parent_id: message.company } })

                    const partitions = await Company.createQueryBuilder('company')
                        .where(`company.partition_parent_id = ${message.company}`)
                        .andWhere('company.delete_date is null')
                        .cache(`company:${message.company}`, 24 * 60 * 60 * 1000)
                        .getMany()

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
                            gmt: message_data.gmt,
                            time_zone: time_zone,
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
                        eventData.data.access_point_name = access_point.name
                        const access_point_data: any = _.pick(access_point, ['id', 'name', 'access_point_zone', 'access_point_zones'])
                        if (access_point_data.access_point_zones) {
                            access_point_data.access_point_zones = _.pick(access_point_data.access_point_zones, ['id', 'name'])
                        }
                        if (access_point.camera_sets && access_point.camera_sets.length && message_data.time) {
                            const camera_set = access_point.camera_sets[0]
                            const cameras = []
                            for (const camera_set_camera of camera_set.camera_set_cameras) {
                                if (camera_set_camera.cameras) {
                                    cameras.push({ id: camera_set_camera.cameras.id, main: camera_set_camera.main, name: camera_set_camera.cameras.name })
                                }
                            }
                            access_point_data.camera_set = {
                                before_event_tms: message_data.time - camera_set.before_event,
                                after_event_tms: message_data.time + camera_set.after_event,
                                cameras
                            }
                        } else {
                            access_point_data.camera_set = null
                        }
                        eventData.data.access_points = access_point_data
                    }
                    if ('gmt' in eventData.data) {
                        if (eventData.data.access_points) {
                            eventData.data.access_points.gmt = eventData.data.gmt
                            eventData.data.access_points.time_zone = time_zone
                        } else {
                            eventData.data.access_points = {
                                gmt: eventData.data.gmt,
                                time_zone: time_zone
                            }
                        }
                    }
                    const EventList: any = eventList

                    if (EventList[message_data.Group]) {
                        eventData.data.event_type = EventList[message_data.Group].name
                        if (EventList[message_data.Group].events[message_data.Event_id]) {
                            eventData.data.event = EventList[message_data.Group].events[message_data.Event_id].event
                            eventData.data.event_source = EventList[message_data.Group].events[message_data.Event_id].source_entity
                            eventData.data.result = EventList[message_data.Group].events[message_data.Event_id].description
                        } else {
                            eventData.data.event = 'Unknown Event_id'
                            eventData.data.event_source = 'Unknown SourceEntity'
                            eventData.data.result = 'Unknown Description'
                        }
                    } else {
                        eventData.data.event_type = 'Unknown Group'
                        eventData.data.event = 'Unknown Event_id'
                        eventData.data.event_source = 'Unknown SourceEntity'
                        eventData.data.result = 'Unknown Description'
                    }
                    eventData.data.event_group_id = message_data.Group
                    eventData.data.event_id = message_data.Event_id
                    eventData.data.Key_HEX = message_data.Key_HEX
                    eventData.data.credential = { type: message_data.Kind_key, code: message_data.Key_HEX }
                    // eventData.data.cardholder_id = message_data.key_id
                    eventData.data.direction = (message_data.Direction === 1) ? 'Exit' : 'Entry'
                    EventLog.create(eventData)
                }
            }
        }).catch(() => {
            // console.log(error)
        })
    }

    public static async cacheCheck (company: number, param: any, check_key: checkCacheKey, body?: any) {
        try {
            if (!param) return
            let key = `${company}:acu_${param}`
            if (check_key === checkCacheKey.CARDHOLDER) {
                key = `${company}:cg_*:acr_*:cr_${param}`
            } else if (check_key === checkCacheKey.ACCESS_POINT) {
                key = `${company}:ap_${param}`
            } else if (check_key === checkCacheKey.GLOBAL_ACCESS_POINT) {
                key = `ap_${param}`
            }
            const keys = await RedisClass.connection.keys(key)
            let value
            if (keys.length) value = await RedisClass.connection.get(keys[0])
            if (value) {
                if (value === '{}') return value
                const data = JSON.parse(value)
                return data
            } else {
                if (body) {
                    if (check_key === checkCacheKey.CARDHOLDER) {
                        const cardholder_group = body.cardholders?.cardholder_groups?.id || 0
                        const access_right = body.cardholders?.access_rights?.id || 0
                        key = `${company}:cg_${cardholder_group}:acr_${access_right}:cr_${param}`
                    } else if (check_key === checkCacheKey.ACCESS_POINT) {
                        key = `${company}:ap_${param}`
                    }
                    await RedisClass.connection.set(key, body ? JSON.stringify(body) : '', 'EX', 10 * 24 * 60 * 60)
                } else {

                }
            }
        } catch (error) {
            // console.log('cacheRequest error: ', error)
        }
    }

    public static async invalidateCache (key: string) {
        const cached_keys = await RedisClass.connection.keys(key)
        for (const cached_key of cached_keys) {
            await RedisClass.connection.del(cached_key)
        }
    }
}
