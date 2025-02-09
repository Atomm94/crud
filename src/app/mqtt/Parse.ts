import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'
import { acuConnectionType } from '../enums/acuConnectionType.enum'

import { scheduleType } from '../enums/scheduleType.enum'
import { AccessRule } from '../model/entity/AccessRule'
import { AccessPoint } from '../model/entity/AccessPoint'
import { ExtDevice } from '../model/entity/ExtDevice'
import SendDeviceMessage from './SendDeviceMessage'
import { IMqttCrudMessaging } from '../Interfaces/messaging.interface'
import { Reader } from '../model/entity/Reader'
import LogController from '../controller/LogController'
import SendSocketMessage from './SendSocketMessage'
import { socketChannels } from '../enums/socketChannels.enum'
import errorList from '../model/entity/errorList.json'
import { checkAndDeleteAccessRight } from '../functions/accessRightDelete'
import SendUserLogMessage from './SendUserLogMessage'
import { logUserEvents } from '../enums/logUserEvents.enum'
import { readerTypes } from '../enums/readerTypes'
import { accessPointDoorState } from '../enums/accessPointDoorState.enum'
import { acuStatus } from '../enums/acuStatus.enum'
import { AcuStatus } from '../model/entity/AcuStatus'
import { AccessPointStatus } from '../model/entity/AccessPointStatus'
import { In } from 'typeorm'
import { Notification } from '../model/entity/Notification'
import { AutoTaskSchedule } from '../model/entity/AutoTaskSchedule'
import { Credential } from '../model/entity/Credential'
import CardKeyController from '../controller/Hardware/CardKeyController'
import moment from 'moment'
import { generateMessageForOperator } from '../functions/checkOperator'
import { acuConnectionMode } from '../enums/acuConnectionMode.enum'
import { acuCloudStatus } from '../enums/acuCloudStatus.enum'

export default class Parse {
    public static async deviceData (topic: string, data: string) {
        try {
            const message: IMqttCrudMessaging = JSON.parse(data)

            message.location = message.device_topic.split('/').slice(0, 2).join('/')
            message.company = Number(message.device_topic.split('/')[1])
            if (message.send_data && message.send_data.user_data && message.send_data.user_data.company) {
                message.company = message.send_data.user_data.company
            }
            message.device_id = Number(message.device_topic.split('/')[3])

            if ('result' in message && 'errorNo' in message.result) {
                const error: number = Number(message.result.errorNo)
                if (error !== 0) {
                    const user = message.send_data.user
                    const error_list: any = errorList
                    const sended_data = (message.send_data.data === 'none') ? {} : Object.assign({}, message.send_data.data)
                    if (error_list[error]) {
                        sended_data.error_description = error_list[error].description
                    } else {
                        sended_data.error_description = 'Unknown Error'
                    }
                    sended_data.device_id = message.device_id
                    new SendSocketMessage(socketChannels.ERROR_CHANNEL, sended_data, message.company, user)
                    if (error === 777) {
                        const description: any = { ...message }
                        delete description.send_data
                        const notification = new Notification({
                            event: `Timeout ${message.device_topic} - ${generateMessageForOperator(message.operator)}`,
                            description: JSON.stringify(description),
                            company: message.company,
                            confirmed: null,
                            confirmed_check: false,
                            access_point: null
                        })
                        await Notification
                            .createQueryBuilder()
                            .insert()
                            .values(notification)
                            .updateEntity(false)
                            .execute()
                        // const newObj = Object.assign(notification, notification_save.generatedMaps[0])

                        new SendSocketMessage(socketChannels.NOTIFICATION, notification, message.company)
                    }
                }
            }

            switch (message.operator) {
                case OperatorType.PING_ACK:
                case OperatorType.HEART_BIT:
                    await this.pingAck(message)
                    break
                case OperatorType.REGISTRATION:
                    await this.deviceRegistration(message)
                    break
                case OperatorType.CANCEL_REGISTRATION_ACK:
                    await this.deviceCancelRegistrationAck(message)
                    break
                case OperatorType.ACCEPT_ACK:
                    await this.deviceAcceptAck(message)
                    break
                case OperatorType.LOGIN_ACK:
                    await this.deviceLoginAck(message)
                    break
                case OperatorType.LOGOUT_ACK:
                    await this.deviceLogOutAck(message)
                    break
                case OperatorType.LOGOUT_EVENT:
                    await this.deviceLogOutEvent(message)
                    break
                case OperatorType.SET_PASS_ACK:
                    await this.deviceSetPassAck(message)
                    break
                case OperatorType.SET_NET_SETTINGS_ACK:
                    await this.deviceSetNetSettingsAck(message)
                    break
                case OperatorType.GET_NET_SETTINGS_ACK:
                    await this.deviceGetNetSettingsAck(message)
                    break
                case OperatorType.SET_DATE_TIME_ACK:
                    await this.deviceSetDateTimeAck(message)
                    break
                case OperatorType.SET_MQTT_SETTINGS_ACK:
                    await this.deviceSetMqttSettingsAck(message)
                    break
                case OperatorType.GET_MQTT_SETTINGS_ACK:
                    await this.deviceGetMqttSettingsAck(message)
                    break
                case OperatorType.GET_STATUS_ACU_ACK:
                    await this.deviceGetStatusAcuAck(message)
                    break
                case OperatorType.SET_EXT_BRD_ACK:
                    await this.deviceSetExtBrdAck(message)
                    break
                case OperatorType.GET_EXT_BRD_ACK:
                    await this.deviceGetExtBrdAck(message)
                    break
                case OperatorType.DEL_EXT_BRD_ACK:
                    await this.deviceDelExtBrdAck(message)
                    break

                case OperatorType.SET_RD_ACK:
                    await this.deviceSetRdAck(message)
                    break
                case OperatorType.GET_RD_ACK:
                    await this.deviceGetRdAck(message)
                    break
                case OperatorType.DEL_RD_ACK:
                    await this.deviceDelRdAck(message)
                    break

                case OperatorType.SET_OUTPUT_ACK:
                    await this.deviceSetOutputAck(message)
                    break
                case OperatorType.GET_OUTPUT_ACK:
                    await this.deviceGetOutputAck(message)
                    break
                case OperatorType.GET_INPUT_ACK:
                    await this.deviceGetInputAck(message)
                    break
                case OperatorType.SET_CTP_DOOR_ACK:
                    await this.deviceSetCtpDoorAck(message)
                    break
                case OperatorType.DEL_CTP_DOOR_ACK:
                    await this.deviceDelCtpDoorAck(message)
                    break
                case OperatorType.GET_CTP_DOOR_ACK:
                    await this.deviceGetCtpDoorAck(message)
                    break

                case OperatorType.SET_CTP_TURNSTILE_ACK:
                    await this.deviceSetCtpTurnstileAck(message)
                    break
                case OperatorType.DEL_CTP_TURNSTILE_ACK:
                    await this.deviceDelCtpTurnstileAck(message)
                    break
                case OperatorType.GET_CTP_TURNSTILE_ACK:
                    await this.deviceGetCtpTurnstileAck(message)
                    break
                case OperatorType.SET_CTP_GATE_ACK:
                    await this.deviceSetCtpGateAck(message)
                    break
                case OperatorType.DEL_CTP_GATE_ACK:
                    await this.deviceDelCtpGateAck(message)
                    break
                case OperatorType.GET_CTP_GATE_ACK:
                    await this.deviceGetCtpGateAck(message)
                    break
                case OperatorType.SET_CTP_GATEWAY_ACK:
                    await this.deviceSetCtpGatewayAck(message)
                    break
                case OperatorType.DEL_CTP_GATEWAY_ACK:
                    await this.deviceDelCtpGatewayAck(message)
                    break
                case OperatorType.GET_CTP_GATEWAY_ACK:
                    await this.deviceGetCtpGatewayAck(message)
                    break
                case OperatorType.SET_CTP_FLOOR_ACK:
                    await this.deviceSetCtpFloorAck(message)
                    break
                case OperatorType.DEL_CTP_FLOOR_ACK:
                    await this.deviceDelCtpFloorAck(message)
                    break
                case OperatorType.GET_CTP_FLOOR_ACK:
                    await this.deviceGetCtpFloorAck(message)
                    break

                case OperatorType.EVENT:
                    await this.deviceEvent(message)
                    break
                case OperatorType.SET_EVENTS_MOD_ACK:
                    await this.deviceSetEventsModAck(message)
                    break
                case OperatorType.GET_EVENTS_MOD_ACK:
                    await this.deviceGetEventsModAck(message)
                    break
                case OperatorType.GET_EVENTS_ACK:
                    await this.deviceGetEventsAck(message)
                    break
                case OperatorType.SET_ACCESS_MODE_ACK:
                    await this.deviceSetAccessModeAck(message)
                    break
                case OperatorType.GET_ACCESS_MODE_ACK:
                    await this.deviceGetAccessModeAck(message)
                    break
                case OperatorType.SINGLE_PASS_ACK:
                    await this.deviceSinglePassAck(message)
                    break
                case OperatorType.SET_CARD_KEYS_ACK:
                    await this.setCardKeysAck(message)
                    break
                case OperatorType.ADD_CARD_KEY_ACK:
                    await this.addCardKeyAck(message)
                    break
                case OperatorType.END_CARD_KEY_ACK:
                    await this.endCardKeyAck(message)
                    break
                case OperatorType.EDIT_KEY_ACK:
                    await this.editKeyAck(message)
                    break
                case OperatorType.DELL_KEYS_ACK:
                    await this.dellKeysAck(message)
                    break
                case OperatorType.DELL_ALL_KEYS_ACK:
                    await this.dellAllKeysAck(message)
                    break
                case OperatorType.SET_SDL_DAILY_ACK:
                    await this.setSdlDailyAck(message)
                    break
                case OperatorType.DEL_SDL_DAILY_ACK:
                    await this.delSdlDailyAck(message)
                    break
                case OperatorType.SET_SDL_WEEKLY_ACK:
                    await this.setSdlWeeklyAck(message)
                    break
                case OperatorType.DEL_SDL_WEEKLY_ACK:
                    await this.delSdlWeeklyAck(message)
                    break
                case OperatorType.SET_SDL_FLEXI_TIME_ACK:
                    await this.setSdlFlexiTimeAck(message)
                    break
                case OperatorType.ADD_DAY_FLEXI_TIME_ACK:
                    await this.addDayFlexiTimeAck(message)
                    break
                case OperatorType.END_SDL_FLEXI_TIME_ACK:
                    await this.endSdlFlexiTimeAck(message)
                    break
                case OperatorType.DEL_SDL_FLEXI_TIME_ACK:
                    await this.delSdlFlexiTimeAck(message)
                    break
                case OperatorType.DEL_DAY_FLEXI_TIME_ACK:
                    await this.delDayFlexiTimeAck(message)
                    break
                case OperatorType.SET_SDL_SPECIFIED_ACK:
                    await this.setSdlSpecifiedAck(message)
                    break
                case OperatorType.ADD_DAY_SPECIFIED_ACK:
                    await this.addDaySpecifiedAck(message)
                    break
                case OperatorType.END_SDL_SPECIFIED_ACK:
                    await this.endSdlSpecifiedAck(message)
                    break
                case OperatorType.DEL_SDL_SPECIFIED_ACK:
                    await this.delSdlSpecifiedAck(message)
                    break
                case OperatorType.DELL_DAY_SPECIFIED_ACK:
                    await this.dellDaySpecifiedAck(message)
                    break
                case OperatorType.SET_SDL_ORDINAL_ACK:
                    await this.setSdlOrdinalAck(message)
                    break
                case OperatorType.DEL_SDL_ORDINAL_ACK:
                    await this.delSdlOrdinalAck(message)
                    break
                case OperatorType.SET_DAY_ORDINAL_ACK:
                    await this.setDayOrdinalAck(message)
                    break
                case OperatorType.DEL_DAY_ORDINAL_ACK:
                    await this.delDayOrdinalAck(message)
                    break
                case OperatorType.DELL_SHEDULE_ACK:
                    await this.dellSheduleAck(message)
                    break
                case OperatorType.DEV_TEST_ACK:
                    await this.deviceDevTestAck(message)
                    break
                case OperatorType.SET_HEART_BIT_ACK:
                    await this.setHeartBitAck(message)
                    break
                case OperatorType.SET_TASK_ACK:
                    await this.setTaskAck(message)
                    break
                case OperatorType.DEL_TASK_ACK:
                    await this.delTaskAck(message)
                    break
                case OperatorType.RESET_APB_ACK:
                    await this.resetApbAck(message)
                    break
                case OperatorType.ACTIVATE_CREDENTIAL_ACK:
                    await this.activateCredentialAck(message)
                    break
                case OperatorType.MAIN_TAIN_ACK:
                    await this.mainTainAck(message)
                    break
                case OperatorType.WEB_PASS_ACK:
                    await this.webPassAck(message)
                    break
                default:
                    break
            }
        } catch (error) {
            // console.log('error deviceData', topic, data, error)
        }
    }

    public static async pingAck (message: IMqttCrudMessaging) {
        try {
            // AcuStatus.updateItem({
            //  where: { company: message.company, serial_number: message.device_id }
            // ).then(async (acuStatusData: AcuStatus) => {
            if (message.result.errorNo === 0) {
                //     if ('firmware_ver' in message.info) acuStatusData.fw_version = message.info.firmware_ver
                //     if ('rev' in message.info) acuStatusData.rev = message.info.rev
                //     if ('api_ver' in message.info) acuStatusData.api_ver = message.info.api_ver
                //     if ('acu_comment' in message.info) acuStatusData.acu_comment = message.info.acu_comment
                //     if ('connection_type' in message.info) acuStatusData.connection_type = (message.info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET
                //     if ('ip_address' in message.info) acuStatusData.ip_address = message.info.ip_address
                //     if ('gateway' in message.info) acuStatusData.gateway = message.info.gateway
                //     if ('subnet_mask' in message.info) acuStatusData.subnet_mask = message.info.subnet_mask
                //     if ('dns_server' in message.info) acuStatusData.dns_server = message.info.dns_server
                //     if ('connection_mod' in message.info) acuStatusData.connection_mod = (message.info.connection_mod === 0) ? acuConnectionMode.DHCP : acuConnectionMode.FIXED
                //     if ('SSID' in message.info) acuStatusData.ssid = message.info.SSID
                await AcuStatus
                    .createQueryBuilder('acu_status')
                    .update(AcuStatus)
                    .set({
                        fw_version: message.info.firmware_ver,
                        rev: message.info.rev,
                        api_ver: message.info.api_ver,
                        acu_comment: message.info.acu_comment,
                        connection_type: (message.info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET,
                        ip_address: message.info.ip_address,
                        gateway: message.info.gateway,
                        subnet_mask: message.info.subnet_mask,
                        dns_server: message.info.dns_server,
                        connection_mod: (message.info.connection_mod === 0) ? acuConnectionMode.DHCP : acuConnectionMode.FIXED,
                        ssid: message.info.SSID,
                        timestamp: new Date().getTime()
                    })
                    .where(`company = ${message.company}`)
                    .andWhere(`serial_number = ${message.device_id}`)
                    .updateEntity(true)
                    .execute()

                const cache_update_key = `acu:acu_statuses:${message.company}*`
                await LogController.invalidateCache(cache_update_key)

        LogController.invalidateCache(`acu:count:${message.company}`)
                // need update result

                if (message.info) {
                    // const access_point_statuses: any = await AccessPointStatus.getAllItems({ where: { acu: { '=': acuStatusData.acu } } })

                    const access_point_statuses: any = await AccessPointStatus.createQueryBuilder('access_point_status')
                        .leftJoinAndSelect('access_point_status.acus', 'acu')
                        .where(`acu.serial_number = '${message.device_id}'`)
                        .andWhere(`access_point_status.company = '${message.company}'`)
                        .getMany()

                    for (const access_point_status of access_point_statuses) {
                        const old_door_state = access_point_status.door_state
                        if (access_point_status.resources) {
                            const resources = JSON.parse(access_point_status.resources)
                            if (resources.Door_sensor) {
                                const gpio_value = `Gpio_input_opt_${resources.Door_sensor.component_source}_idx_${resources.Door_sensor.input}`
                                if (resources.Door_sensor && gpio_value in message.info) {
                                    if (message.info[gpio_value] === 0) {
                                        access_point_status.door_state = accessPointDoorState.CLOSED
                                    } else {
                                        access_point_status.door_state = accessPointDoorState.OPEN
                                    }
                                } else {
                                    access_point_status.door_state = accessPointDoorState.NO_SENSOR
                                }
                                if (old_door_state !== access_point_status.door_state) {
                                    await AccessPointStatus.updateItem(access_point_status)
                                }
                            }
                        }
                    }
                }
            }
            // }).catch(err => console.log('pingAck exception', err))
        } catch (error) {
            // console.log('error pingack ', error)
        }
    }

    public static async deviceRegistration (message: IMqttCrudMessaging) {
        try {
            const device_id = message.info.device_id
            const acu = await Acu.findOne({ where: { serial_number: device_id, status: In([acuStatus.PENDING, acuStatus.ACTIVE]), company: message.company } })

            if (!acu || acu.status === acuStatus.PENDING) {
                const acu_data: any = acu || {}
                acu_data.name = message.info.name
                acu_data.description = message.info.note
                acu_data.serial_number = device_id
                acu_data.model = message.info.model
                acu_data.fw_version = message.info.firmware_ver
                acu_data.rev = message.info.rev
                acu_data.api_ver = message.info.api_ver
                acu_data.acu_comment = message.info.acu_comment
                if (!acu) acu_data.cloud_status = acuCloudStatus.ONLINE
                // acu_data.registration_date = moment(Number(message.info.time) * 1000).format('YYYY-MM-DD HH:mm:ss')
                acu_data.registration_date = moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
                acu_data.time = JSON.stringify({
                    // time_zone: message.info.gmt,
                    time_zone: 'Africa/Casablanca',
                    time_zone_unix: '+00:00',
                    timezone_from_facility: false,
                    enable_daylight_saving_time: false,
                    daylight_saving_time_from_user_account: false
                })
                acu_data.company = message.company
                if (acu) {
                    acu_data.id = acu.id
                }

                await Acu.save(acu_data, { transaction: false })
                // const user = message.send_data

                // if (!acu) { // case when need send ACCEPT only first time
                new SendDeviceMessage(OperatorType.ACCEPT, message.location, device_id, 'none')
                // }
            }
        } catch (error) {
            // console.log('error deviceRegistrion ', error)
        }
    }

    public static async deviceCancelRegistrationAck (message: IMqttCrudMessaging) {
        // console.log('deviceCancelRegistration', message)
        if (message.result.errorNo === 0) {
            // const device_id = message.device_id
            // const company = message.company
            // Acu.findOne({ where: { serial_number: device_id, company: company } }).then((acuData: Acu) => {
            //     // when admin deleted this acu what we do ???
            //     Acu.destroyItem(acuData)
            //     new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${Acu.name}/${acuData.name}`, { name: acuData.name })
            //     new SendSocketMessage(socketChannels.ACU_DELETE, acuData, message.company, message.send_data.user)
            // })
        }
    }

    public static deviceAcceptAck (message: IMqttCrudMessaging) {
        // console.log('deviceAcceptAck', message)
        if (message.result.errorNo === 0) {
            // const company = message.company
            const device_id = message.device_id
            Acu.findOne({ where: { serial_number: device_id /*, company: company */ } }).then((acuData: Acu) => {
                // when admin deleted this acu what we do ???
                const send_data: any = {
                    username: acuData.username ? acuData.username : 'admin',
                    // password: acuData.password ? acuData.password : 'admin'
                    password: acuData.password ? acuData.password : ''
                }
                new SendDeviceMessage(OperatorType.LOGIN, message.location, message.device_id, send_data, message.send_data.user, message.session_id)
            })
        }
    }

    public static async deviceLoginAck (message: IMqttCrudMessaging) {
        // console.log('deviceLoginAck', message)
        // if (message.result.errorNo === 0) {
        const acu: Acu = await Acu.findOneOrFail({ where: { serial_number: message.device_id, company: message.company } })
        if (acu) {
            if (acu.session_id == null) {
                /* OPEN FOR GENERATE PASSWORD */
                // const generate_pass = uid(32)
                const send_data = {
                    username: 'admin',
                    password: 'admin'/* generate_pass */,
                    use_sha: 0
                }
                new SendDeviceMessage(OperatorType.SET_PASS, message.location, message.device_id, send_data)
            }
            acu.session_id = message.session_id
            await acu.save({ transaction: false })
            // console.log('login complete')
        } else {
            // console.log('error deviceLoginAck', message)
        }
        // }
    }

    public static async deviceLogOutAck (message: IMqttCrudMessaging) {
        // console.log('deviceLogOutAck', message)
        if (message.result.errorNo === 0) {
            // console.log('logout complete')
            const company = message.company
            const device_id = message.device_id
            const acu = await Acu.findOneOrFail({ where: { serial_number: device_id, company: company } })
            acu.session_id = '0'
            await acu.save({ transaction: false })
            // this.login(message.topic)
        }
    }

    public static async deviceSetPassAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetPassAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            const device_id = message.device_id
            const acu = await Acu.findOne({ where: { serial_number: device_id, company: company } })
            if (acu) {
                acu.password = message.send_data.data.password
                await acu.save({ transaction: false })
                new SendDeviceMessage(OperatorType.GET_NET_SETTINGS, message.location, message.device_id)
            } else {
                // console.log('error deviceSetPass', message)
            }
        }
    }

    public static async deviceLogOutEvent (message: IMqttCrudMessaging) {
        // console.log('deviceLogOutEvent', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            const device_id = message.device_id
            const acu: Acu = await Acu.findOneOrFail({ where: { serial_number: device_id, company: company } })
            if (acu) {
                acu.session_id = '0'
                await acu.save({ transaction: false })
                const loginData = {
                    username: acu.username,
                    password: acu.password
                }
                new SendDeviceMessage(OperatorType.LOGIN, message.location, message.device_id, loginData)
                // console.log('deviceLogOutEvent complete')
            } else {
                // console.log('error deviceLogOutEvent', message)
            }
        }
    }

    public static async deviceSetNetSettingsAck (message: IMqttCrudMessaging) {
        try {
            if (message.result.errorNo === 0) {
                // const company = message.company
                // const device_id = message.device_id
                // const acu: any = await Acu.findOneOrFail({ where: {serial_number: device_id /*, company: company */ })
                // if (acu) {
                //     const info = message.send_data.data
                //     acu.network = {
                //         connection_type: (info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET,
                //         dhcp: info.dhcp,
                //         fixed: !info.dhcp,
                //         ip_address: info.ip_address,
                //         subnet_mask: info.subnet_mask,
                //         gateway: info.gateway,
                //         dns_server: info.dns_server
                //     }
                //     const update_acu = await Acu.updateItem({ id: acu.id, network: acu.network } as Acu)
                //     new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${Acu.name}/${update_acu.old.name}`, update_acu)
                //     // console.log('deviceSetNetSettingsAck complete')
                // } else {
                //     // console.log('error deviceSetNetSettingsAck', message)
                // }
            }
        } catch (error) {
            // console.log('error deviceSetNetSettingsAck', error)
        }
    }

    public static async deviceGetNetSettingsAck (message: any) {
        // {
        try {
            if (message.result.errorNo === 0) {
                const company = message.company
                const device_id = message.device_id
                const acu: any = await Acu.findOne({ where: { serial_number: device_id, company: company } })

                if (acu) {
                    acu.network = JSON.stringify({
                        connection_type: (message.info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET,
                        connection_mod: (message.info.dhcp) ? 0 : 1,
                        ip_address: message.info.ip_address,
                        subnet_mask: message.info.mask,
                        gateway: message.info.Gate,
                        dns_server: message.info.DNS1
                    })
                    await acu.save({ transaction: false })
                } else {
                    console.log(`error - cant find acu with serial number ${device_id} and company ${company}`)
                }
            }
        } catch (error) {
            // console.log('error deviceSetNetSettingsAck', error)
        }
    }

    public static async deviceSetDateTimeAck (message: IMqttCrudMessaging) {
        if (message.result.errorNo === 0) {
            const company = message.company
            const device_id = message.device_id
            const acu: Acu = await Acu.findOneOrFail({ where: { serial_number: device_id, company: company } })
            if (acu) {
                acu.time = JSON.stringify(message.send_data.data)
                const update_acu = await Acu.updateItem({ id: acu.id, time: acu.time } as Acu)
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${Acu.name}/${update_acu.old.name}`, update_acu)
                // console.log('deviceSetDateTimeAck complete')
            } else {
                // console.log('error deviceSetDateTimeAck', message)
            }
        }
    }

    public static deviceSetMqttSettingsAck (message: IMqttCrudMessaging): void {
        // console.log('deviceSetMqttSettingsAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceSetMqttSettingsAck complete')
        }
    }

    public static deviceGetMqttSettingsAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetMqttSettingsAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetMqttSettingsAck complete')
        }
    }

    public static deviceGetStatusAcuAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetStatusAcuAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetStatusAcuAck complete')
        }
    }

    public static async deviceSetExtBrdAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetExtBrdAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            if (message.send_data.update) {
                const save = await ExtDevice.updateItem(message.send_data.data as ExtDevice)
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${ExtDevice.name}/${save.old.name}`, save)
                new SendSocketMessage(socketChannels.EXT_BRD_UPDATE, save.new, message.company, message.send_data.user)
                if (save) {
                    // console.log('ExtDevice update completed')
                }
            } else {
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${ExtDevice.name}/${message.send_data.data.name}`, { name: message.send_data.data.name })
                // console.log('ExtDevice insert completed')
            }
        } else {
            if (!message.send_data.update) {
                const ext_brd: any = await ExtDevice.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
                await ExtDevice.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
                new SendSocketMessage(socketChannels.EXT_BRD_DELETE, ext_brd, message.company, message.send_data.user)
            }
        }
    }

    public static deviceGetExtBrdAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetExtBrdAck', message)
        if (message.result.errorNo === 0) {
            // console.log('ExtDevice complete')
        }
    }

    public static async deviceDelExtBrdAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelExtBrdAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 12) {
            const company = message.company
            const ext_device = await ExtDevice.findOneOrFail({ where: { id: message.send_data.data.id /*, company: message.company */ }, relations: ['acus'] })
            await ExtDevice.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${ExtDevice.name}/${ext_device.name}`, { name: ext_device.name })
            new SendSocketMessage(socketChannels.EXT_BRD_DELETE, ext_device, message.company, message.send_data.user)
            // console.log('DelExtDevice complete')
        }
    }

    public static async deviceSetRdAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetRd', message)
        let reader_data
        const elevator_mode = message.send_data.data.elevator_mode
        if (elevator_mode) {
            reader_data = message.send_data.data.reader
        } else {
            const ind = message.send_data.data.answer_qty
            reader_data = message.send_data.data.readers[ind]
        }

        if (message.result.errorNo === 0) {
            const company = message.company
            if (reader_data.update) {
                const save = await Reader.updateItem(reader_data as Reader)
                if (!elevator_mode) {
                    const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point }, relations: ['acus'] })
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${Reader.name}/${access_point.acus.name}/${access_point.name}/${readerTypes[save.old.type]}`, save)
                    new SendSocketMessage(socketChannels.READER_UPDATE, save.new, message.company, message.send_data.user)
                    if (save) {
                        // console.log('Reader update completed')
                    }
                } else {
                    const acu = await Acu.findOneOrFail({ where: { reader: save.old.id } })
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${Reader.name}/${acu.name}/${readerTypes[save.old.type]}`, save)
                    new SendSocketMessage(socketChannels.READER_UPDATE, save.new, message.company, message.send_data.user)
                    if (save) {
                        // console.log('Reader update completed')
                    }
                }
            } else {
                const reader: any = await Reader.findOneOrFail({ where: { id: reader_data.id }, relations: ['access_points', 'access_points.acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${Reader.name}/${reader.access_points.acus.name}/${reader.access_points.name}/${readerTypes[reader.type]}`, { type: readerTypes[reader.type] })
                // console.log('Reader insert completed')
            }
        } else {
            if (!elevator_mode /* && message.result.errorNo === 777 */) {
                for (const _reader of message.send_data.data.readers) {
                    if (!_reader.update) {
                        const reader: any = await Reader.findOne({ where: { id: _reader.id }, relations: ['access_points', 'access_points.acus'] })
                        if (reader) {
                            await Reader.destroyItem({ id: _reader.id /*, company: message.company */ })
                            new SendSocketMessage(socketChannels.READER_DELETE, reader, message.company, message.send_data.user)
                        }
                    }
                }
            } else if (!reader_data.update) {
                const reader: any = await Reader.findOne({ where: { id: reader_data.id }, relations: ['access_points', 'access_points.acus'] })
                if (reader) {
                    await Reader.destroyItem({ id: reader_data.id /*, company: message.company */ })
                    new SendSocketMessage(socketChannels.READER_DELETE, reader, message.company, message.send_data.user)
                }
            }
        }
    }

    public static deviceGetRdAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetRdAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetRdAck complete')
        }
    }

    public static async deviceDelRdAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelRdAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 5) {
            const company = message.company

            const reader: any = await Reader.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points', 'access_points.acus'] })
            await Reader.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${Reader.name}/${reader.access_points.acus.name}/${reader.access_points.name}/${readerTypes[reader.type]}`, { type: readerTypes[reader.type] })

            new SendSocketMessage(socketChannels.READER_DELETE, reader, message.company, message.send_data.user)
            // console.log('deviceDelRdAck complete')
            // const access_point: any = {
            //     id: message.send_data.data.access_point,
            //     readers: message.send_data.data
            // }
            // if (message.send_data.data.access_point_type === accessPointType.DOOR) {
            //     new SendDeviceMessage(OperatorType.SET_CTP_DOOR, message.location, message.device_id, message.session_id, access_point)
            // } else if (message.send_data.data.access_point_type === accessPointType.GATE) {
            // new SendDeviceMessage(OperatorType.SET_CTP_GATE, message.location, message.device_id, message.session_id, access_point)
            // } else if (message.send_data.data.access_point_type === accessPointType.GATEWAY) {
            // new SendDeviceMessage(OperatorType.SET_CTP_GATEWAY, message.location, message.device_id, message.session_id, access_point)
            // } else if (message.send_data.data.access_point_type === accessPointType.FLOOR) {
            // new SendDeviceMessage(OperatorType.SET_CTP_FLOOR, message.location, message.device_id, message.session_id, access_point)
            // } else if (message.send_data.data.access_point_type === accessPointType.TURNSTILE) {
            // new SendDeviceMessage(OperatorType.SET_CTP_TURNSTILE, message.location, message.device_id, message.session_id, access_point)
            // }
            // }
        }
    }

    public static deviceSetOutputAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetRdAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetRdAck complete')
        }
    }

    public static deviceGetOutputAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetOutputAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetOutputAck complete')
        }
    }

    public static deviceGetInputAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetInputAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetInputAck complete')
        }
    }

    public static async deviceSetCtpDoorAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpDoorAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            if (message.send_data.update) {
                if ('work_mode' in message.send_data.data) {
                    const auto_task = await AutoTaskSchedule.findOne({ where: { access_point: message.send_data.data.id, status: false } })
                    if (auto_task) {
                        auto_task.status = true
                        await auto_task.save({ transaction: false })
                    }
                }
                message.send_data.data.company = company
                const save = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                const acu = await Acu.findOneOrFail({ where: { id: save.old.acu } })
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: save.new.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessPoint.name}/${acu.name}/${save.old.name}`, save)
                if (!message.send_data.data.readers) {
                    new SendSocketMessage(socketChannels.ACCESS_POINT_UPDATE, access_point, message.company, message.send_data.user)
                }
                if (save) {
                }
            } else {
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async deviceDelCtpDoorAck (message: IMqttCrudMessaging) {
        if (message.result.errorNo === 0 || message.result.errorNo === 5) {
            const company = message.company
            const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
            await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
            // console.log('deviceDelCtpDoorAck delete completed')
        }
    }

    public static async deviceGetCtpDoorAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            // console.log('deviceGetCtpTurnstileAck insert completed')
        }
    }

    public static async deviceSetCtpTurnstileAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            if (message.send_data.update) {
                if ('work_mode' in message.send_data.data) {
                    const auto_task = await AutoTaskSchedule.findOne({ where: { access_point: message.send_data.data.id, status: false } })
                    if (auto_task) {
                        auto_task.status = true
                        await auto_task.save({ transaction: false })
                    }
                }
                message.send_data.data.company = company
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                const acu = await Acu.findOneOrFail({ where: { id: save.old.acu } })

                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: save.new.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessPoint.name}/${acu.name}/${save.old.name}`, save)
                if (!message.send_data.data.readers) {
                    new SendSocketMessage(socketChannels.ACCESS_POINT_UPDATE, access_point, message.company, message.send_data.user)
                }
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async deviceDelCtpTurnstileAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpTurnstileAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 5) {
            const company = message.company
            const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
            await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
            // console.log('deviceDelCtpDoorAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpTurnstileAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            // await AccessPoint.destroyItem({ id: message.send_data.data.id, company: message.company })
            // console.log('deviceGetCtpTurnstileAck insert completed')
        } else {
        }
    }

    public static async deviceSetCtpGateAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpGateAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            if (message.send_data.update) {
                if ('work_mode' in message.send_data.data) {
                    const auto_task = await AutoTaskSchedule.findOne({ where: { access_point: message.send_data.data.id, status: false } })
                    if (auto_task) {
                        auto_task.status = true
                        await auto_task.save({ transaction: false })
                    }
                }
                message.send_data.data.company = company
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                const acu = await Acu.findOneOrFail({ where: { id: save.old.acu } })

                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: save.new.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessPoint.name}/${acu.name}/${save.old.name}`, save)
                if (!message.send_data.data.readers) {
                    new SendSocketMessage(socketChannels.ACCESS_POINT_UPDATE, access_point, message.company, message.send_data.user)
                }
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async deviceDelCtpGateAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpGateAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 5) {
            const company = message.company
            const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
            await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
            // console.log('deviceDelCtpGateAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpGateAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpGateAck', message)
        if (message.result.errorNo === 0) {
            // await AccessPoint.destroyItem({ id: message.send_data.data.id, company: message.company })
            // console.log('deviceGetCtpGateAck insert completed')
        } else {
        }
    }

    public static async deviceSetCtpGatewayAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpGatewayAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            if (message.send_data.update) {
                if ('work_mode' in message.send_data.data) {
                    const auto_task = await AutoTaskSchedule.findOne({ where: { access_point: message.send_data.data.id, status: false } })
                    if (auto_task) {
                        auto_task.status = true
                        await auto_task.save({ transaction: false })
                    }
                }
                message.send_data.data.company = company
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                const acu = await Acu.findOneOrFail({ where: { id: save.old.acu } })

                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: save.new.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessPoint.name}/${acu.name}/${save.old.name}`, save)
                if (!message.send_data.data.readers) {
                    new SendSocketMessage(socketChannels.ACCESS_POINT_UPDATE, access_point, message.company, message.send_data.user)
                }
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async deviceDelCtpGatewayAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpGatewayAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 5) {
            const company = message.company
            const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
            await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
            // console.log('deviceDelCtpGatewayAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpGatewayAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpGatewayAck', message)
        if (message.result.errorNo === 0) {
            // await AccessPoint.destroyItem({ id: message.send_data.data.id, company: message.company })
            // console.log('deviceGetCtpGatewayAck insert completed')
        } else {
        }
    }

    public static async deviceSetCtpFloorAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpFloorAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            if (message.send_data.update) {
                if ('work_mode' in message.send_data.data) {
                    const auto_task = await AutoTaskSchedule.findOne({ where: { access_point: message.send_data.data.id, status: false } })
                    if (auto_task) {
                        auto_task.status = true
                        await auto_task.save({ transaction: false })
                    }
                }
                message.send_data.data.company = company
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                const acu = await Acu.findOneOrFail({ where: { id: save.old.acu } })
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: save.new.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessPoint.name}/${acu.name}/${save.old.name}`, save)
                if (!message.send_data.data.readers) {
                    new SendSocketMessage(socketChannels.ACCESS_POINT_UPDATE, access_point, message.company, message.send_data.user)
                }
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async deviceDelCtpFloorAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpFloorAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 5) {
            const company = message.company
            const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['acus'] })
            await AccessPoint.destroyItem({ id: message.send_data.data.id /*, company: company */ })
            new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessPoint.name}/${access_point.acus.name}/${access_point.name}`, { name: access_point.name })
            // console.log('deviceDelCtpFloorAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpFloorAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpFloorAck', message)
        if (message.result.errorNo === 0) {
            // await AccessPoint.destroyItem({ id: message.send_data.data.id, company: message.company })
            // console.log('deviceGetCtpFloorAck insert completed')
        } else {
        }
    }

    public static deviceEvent (message: IMqttCrudMessaging): void {
        // console.log('deviceEvent', message)
        if (message.info) {
            LogController.createEventFromDevice(message)
        }
    }

    public static deviceSetEventsModAck (message: IMqttCrudMessaging): void {
        // console.log('deviceSetEventsModAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceSetEventsModAck complete')
        } else {
        }
    }

    public static deviceGetEventsModAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetEventsModAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetEventsModAck complete')
        } else {
        }
    }

    public static deviceGetEventsAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetEventsAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetEventsAck complete')
        } else {
        }
    }

    public static async deviceSetAccessModeAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetAccessModeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceSetAccessModeAck complete')
            const company = message.company
            const data: any = {
                id: message.send_data.data.id,
                company: company
            }
            let change = false
            if (message.send_data.data.mode) {
                change = true
                data.mode = message.send_data.data.mode
            }
            if (message.send_data.data.exit_mode) {
                change = true
                data.exit_mode = message.send_data.data.exit_mode
            }
            if (change) {
                await AccessPoint.updateItem(data as AccessPoint)
            }

            // const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id /*, company: company */ } })
            // AccessPoint.save(access_point, { transaction: false })
            //     .then(() => { })
            //     .catch((err: any) => { console.log('deviceSetAccessModeAck AccessPoint save error', err) })
        } else {
        }
    }

    public static deviceGetAccessModeAck (message: IMqttCrudMessaging): void {
        // console.log('deviceGetAccessModeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceGetAccessModeAck complete')
        } else {
        }
    }

    public static deviceSinglePassAck (message: IMqttCrudMessaging): void {
        // console.log('deviceSinglePassAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceSinglePassAck complete')
        } else {
        }
    }

    public static async setCardKeysAck (message: IMqttCrudMessaging) {
        // console.log('setCardKeysAck', message)
        if (message.result.errorNo === 0) {
            // console.log('setCardKeysAck complete')
        } else {
            // await Cardholder.destroyItem({ id: message.send_data.data.id })
        }
    }

    public static async addCardKeyAck (message: IMqttCrudMessaging) {
        // console.log('addCardKeyAck', message)
        if (message.result.errorNo === 0) {
            // console.log('addCardKeyAck complete')
        } else {
            // await Cardholder.destroyItem({ id: message.send_data.data.id })
        }
    }

    public static async endCardKeyAck (message: IMqttCrudMessaging) {
        // console.log('endCardKeyAck', message)
        if (message.result.errorNo === 0) {
            // console.log('endCardKeyAck complete')
        } else {
            // await Cardholder.destroyItem({ id: message.send_data.data.id })
        }
    }

    public static editKeyAck (message: IMqttCrudMessaging): void {
        // console.log('editKeyAck', message)
        if (message.result.errorNo === 0) {
        } else {
        }
    }

    public static dellKeysAck (message: IMqttCrudMessaging): void {
        // console.log('dellKeysAck', message)
        if (message.result.errorNo === 0) {
            // console.log('dellKeysAck complete')
        } else {
        }
    }

    public static dellAllKeysAck (message: IMqttCrudMessaging): void {
        // console.log('dellAllKeysAck', message)
        if (message.result.errorNo === 0) {
            // console.log('dellAllKeysAck complete')
        } else {
        }
    }

    public static async setSdlDailyAck (message: IMqttCrudMessaging) {
        // console.log('setSdlDailyAck', message)
        const timframe_flag = message.send_data.data.timframe_flag
        if (message.result.errorNo === 0) {
            if (!timframe_flag) {
                const company = message.company
                if (message.send_data.update) {
                    const save = await AccessRule.updateItem(message.send_data.data as AccessRule)
                    const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point } })
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessRule.name}/${access_point.name}`, save)
                } else {
                    const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                }
            }
            // console.log('setSdlDailyAck complete')
        } else {
            if (!timframe_flag) {
                if (!message.send_data.update) {
                    await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
                }
            }
        }
    }

    public static async delSdlDailyAck (message: IMqttCrudMessaging) {
        try {
            // console.log('delSdlDailyAck', message)
            // const acu: any = await Acu.findOne({ where: {erial_number: message.device_id, company: message.company })

            if (message.result.errorNo === 0 || message.result.errorNo === 11) {
                const company = message.company
                if (!message.send_data.update) {
                    const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                    await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })

                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                    checkAndDeleteAccessRight(message.send_data.data, message.company, message.send_data.user_data)
                    // console.log('dellSheduleAck complete')
                }
            }
        } catch (error) {
        }
    }

    public static async setSdlWeeklyAck (message: IMqttCrudMessaging) {
        // console.log('setSdlWeeklyAck', message)
        const timframe_flag = message.send_data.data.timframe_flag
        if (message.result.errorNo === 0) {
            if (!timframe_flag) {
                const company = message.company
                if (message.send_data.update) {
                    const save = await AccessRule.updateItem(message.send_data.data as AccessRule)
                    const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point } })
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessRule.name}/${access_point.name}`, save)
                } else {
                    const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                }
                // console.log('setSdlWeeklyAck complete')
            }
        } else {
            if (!timframe_flag) {
                if (!message.send_data.update) {
                    await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
                }
            }
        }
    }

    public static async delSdlWeeklyAck (message: IMqttCrudMessaging) {
        // console.log('delSdlWeeklyAck', message)

        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
            const company = message.company
            if (!message.send_data.update) {
                const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })

                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                checkAndDeleteAccessRight(message.send_data.data, message.company, message.send_data.user_data)
                // console.log('dellSheduleAck complete')
            }
        } else {
        }
    }

    public static async setSdlFlexiTimeAck (message: IMqttCrudMessaging) {
        // console.log('setSdlFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('setSdlFlexiTimeAck complete')
            const user = message.send_data.user
            new SendDeviceMessage(OperatorType.ADD_DAY_FLEXI_TIME, message.location, message.device_id, message.send_data, user, message.session_id)
        }
    }

    public static async addDayFlexiTimeAck (message: IMqttCrudMessaging) {
        // console.log('addDayFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('addDayFlexiTimeAck complete')
            const days = message.send_data.data.days
            const user = message.send_data.user
            if (!Object.keys(days).length) {
                new SendDeviceMessage(OperatorType.END_SDL_FLEXI_TIME, message.location, message.device_id, message.send_data.data, user, message.session_id)
            } else {
                new SendDeviceMessage(OperatorType.ADD_DAY_FLEXI_TIME, message.location, message.device_id, message.send_data.data, user, message.session_id)
            }
        }
    }

    public static async endSdlFlexiTimeAck (message: IMqttCrudMessaging) {
        // console.log('endSdlFlexiTimeAck', message)
        const timframe_flag = message.send_data.data.data.timframe_flag
        if (message.result.errorNo === 0) {
            const company = message.company
            if (!timframe_flag) {
                if (message.send_data.data.update) {
                    const save = await AccessRule.updateItem(message.send_data.data.data as AccessRule)
                    const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point } })
                    new SendUserLogMessage(company, message.send_data.data.user_data, logUserEvents.CHANGE, `${AccessRule.name}/${access_point.name}`, save)
                } else {
                    const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.data.id }, relations: ['access_points'] })
                    new SendUserLogMessage(company, message.send_data.data.user_data, logUserEvents.CREATE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                }
                // console.log('endSdlFlexiTimeAck complete')
            }
        } else {
            if (!timframe_flag) {
                if (!message.send_data.update) {
                    await AccessRule.destroyItem({ id: message.send_data.data.data.id /*, company: message.company */ })
                }
            }
        }
    }

    public static async delSdlFlexiTimeAck (message: IMqttCrudMessaging) {
        // console.log('delSdlFlexiTimeAck', message)

        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
            const company = message.company
            if (!message.send_data.update) {
                const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })

                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                checkAndDeleteAccessRight(message.send_data.data, message.company, message.send_data.user_data)
                // console.log('dellSheduleAck complete')
            }
        } else {
        }
    }

    public static delDayFlexiTimeAck (message: IMqttCrudMessaging): void {
        // console.log('delDayFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('delDayFlexiTimeAck complete')
        } else {
        }
    }

    public static setSdlSpecifiedAck (message: IMqttCrudMessaging): void {
        // console.log('setSdlSpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('setSdlSpecifiedAck complete')
            const user = message.send_data.user

            new SendDeviceMessage(OperatorType.ADD_DAY_SPECIFIED, message.location, message.device_id, message.send_data, user, message.session_id)
        }
    }

    public static addDaySpecifiedAck (message: IMqttCrudMessaging): void {
        // console.log('addDaySpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('addDaySpecifiedAck complete')
            const days = message.send_data.data.days
            const user = message.send_data.user

            if (!Object.keys(days).length) {
                new SendDeviceMessage(OperatorType.END_SDL_SPECIFIED, message.location, message.device_id, message.send_data.data, user, message.session_id)
            } else {
                new SendDeviceMessage(OperatorType.ADD_DAY_SPECIFIED, message.location, message.device_id, message.send_data.data, user, message.session_id)
            }
        }
    }

    public static async endSdlSpecifiedAck (message: IMqttCrudMessaging) {
        // console.log('endSdlSpecifiedAck', message)
        const timframe_flag = message.send_data.data.data.timframe_flag
        if (message.result.errorNo === 0) {
            if (!timframe_flag) {
                const company = message.company
                if (message.send_data.data.update) {
                    const save = await AccessRule.updateItem(message.send_data.data.data as AccessRule)
                    const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point } })
                    new SendUserLogMessage(company, message.send_data.data.user_data, logUserEvents.CHANGE, `${AccessRule.name}/${access_point.name}`, save)
                } else {
                    const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.data.id }, relations: ['access_points'] })
                    new SendUserLogMessage(company, message.send_data.data.user_data, logUserEvents.CREATE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                }
                // console.log('endSdlSpecifiedAck complete')
            }
        } else {
            if (!timframe_flag) {
                if (!message.send_data.update) {
                    await AccessRule.destroyItem({ id: message.send_data.data.data.id /*, company: message.company */ })
                }
            }
        }
    }

    public static async delSdlSpecifiedAck (message: IMqttCrudMessaging) {
        // console.log('delSdlSpecifiedAck', message)

        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
            const company = message.company
            if (!message.send_data.update) {
                const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })

                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                checkAndDeleteAccessRight(message.send_data.data, message.company, message.send_data.user_data)
                // console.log('dellSheduleAck complete')
            }
        } else {
        }
    }

    public static setSdlOrdinalAck (message: IMqttCrudMessaging): void {
        // console.log('setSdlSpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('setSdlSpecifiedAck complete')
            const user = message.send_data.user

            new SendDeviceMessage(OperatorType.SET_DAY_ORDINAL, message.location, message.device_id, message.send_data, user, message.session_id)
        }
    }

    public static async delSdlOrdinalAck (message: IMqttCrudMessaging) {
        // console.log('delSdlSpecifiedAck', message)

        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
            const company = message.company
            if (!message.send_data.update) {
                const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })

                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                checkAndDeleteAccessRight(message.send_data.data, message.company, message.send_data.user_data)
                // console.log('dellSheduleAck complete')
            }
        } else {
        }
    }

    public static async setDayOrdinalAck (message: IMqttCrudMessaging) {
        // console.log('setDayOrdinalAck', message)
        if (message.result.errorNo === 0) {
            // console.log('setDayOrdinalAck complete')
            const days = message.send_data.data.days
            const user = message.send_data.user

            if (Object.keys(days).length) {
                new SendDeviceMessage(OperatorType.SET_DAY_ORDINAL, message.location, message.device_id, message.send_data.data, user, message.session_id)
            } else {
                const company = message.company
                if (message.send_data.data.update) {
                    const save = await AccessRule.updateItem(message.send_data.data.data as AccessRule)
                    const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point } })
                    new SendUserLogMessage(company, message.send_data.data.user_data, logUserEvents.CHANGE, `${AccessRule.name}/${access_point.name}`, save)
                } else {
                    const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.data.id }, relations: ['access_points'] })
                    new SendUserLogMessage(company, message.send_data.data.user_data, logUserEvents.CREATE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                }
                // console.log('setDayOrdinalAck complete')
            }
        } else {
            if (!message.send_data.update) {
                await AccessRule.destroyItem({ id: message.send_data.data.data.id /*, company: message.company */ })
            }
        }
    }

    public static delDayOrdinalAck (message: IMqttCrudMessaging): void {
        // console.log('dellDaySpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('dellDaySpecifiedAck complete')
        } else {
        }
    }

    public static dellDaySpecifiedAck (message: IMqttCrudMessaging): void {
        // console.log('dellDaySpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('dellDaySpecifiedAck complete')
        } else {
        }
    }

    public static async dellSheduleAck (message: IMqttCrudMessaging) {
        // console.log('dellSheduleAck', message)
        const acu = await Acu.findOneOrFail({ where: { serial_number: message.device_id, company: message.company } })

        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                let operator: OperatorType = OperatorType.SET_SDL_DAILY
                if (message.send_data.data.schedule_type === scheduleType.WEEKLY) {
                    operator = OperatorType.SET_SDL_WEEKLY
                } else if (message.send_data.data.schedule_type === scheduleType.FLEXITIME) {
                    operator = OperatorType.SET_SDL_FLEXI_TIME
                } else if (message.send_data.data.schedule_type === scheduleType.SPECIFIC) {
                    operator = OperatorType.SET_SDL_SPECIFIED
                } else if (message.send_data.data.schedule_type === scheduleType.ORDINAL) {
                    operator = OperatorType.SET_SDL_ORDINAL
                }
                const user = message.send_data.user

                new SendDeviceMessage(operator, message.location, acu.serial_number, message.send_data, user, acu.session_id, false)
                // console.log('dellSheduleAck complete')
            }
        } else {
        }
    }

    public static deviceDevTestAck (message: IMqttCrudMessaging): void {
        // console.log('deviceDevTestAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceDevTestAck complete')
        } else {
        }
    }

    public static async setHeartBitAck (message: IMqttCrudMessaging) {
        // console.log('setHeartBitAck', message)
        if (message.result.errorNo === 0) {
            // console.log('setHeartBitAck complete')
            const acu = await Acu.findOneOrFail({ where: { serial_number: message.device_id, company: message.company } })
            if (!acu.heart_bit) {
                acu.heart_bit = true
                acu.save({ transaction: false })
                    .then(() => { })
                    .catch(() => { })
            }
        } else {
        }
    }

    public static async setTaskAck (message: IMqttCrudMessaging) {
        // console.log('setTaskAck', message)
        if (message.send_data.data.id !== 0) { // id - 0 when that task for one time...
            if (message.result.errorNo === 0) {
                if (message.send_data.update) {
                    await AutoTaskSchedule.updateItem(message.send_data.data)
                }
                // console.log('setTaskAck complete')
            } else {
                await AutoTaskSchedule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async delTaskAck (message: IMqttCrudMessaging) {
        // console.log('setTaskAck', message)
        if (message.send_data.data.id !== 0) { // id - 0 when that task for one time...
            if (message.result.errorNo === 0) {
                await AutoTaskSchedule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })
            }
        }
    }

    public static async resetApbAck (message: IMqttCrudMessaging) {
        // console.log('resetApbAck', message)
        if (message.result.errorNo === 0) {
        }
    }

    public static async activateCredentialAck (message: any) {
        try {
            // console.log('activateCredentialAck', message)
            if (message.result.errorNo === 0) {
                if (message.event_data) {
                    const send_data = message.send_data
                    const guest = send_data.data.cardholder
                    const code = parseInt(message.event_data.info.Key_HEX.replace(/ /g, ''), 16).toString()
                    const check_dublicate = await Credential.findOne({ where: { code, company: guest.company } })
                    if (check_dublicate) {
                        const send_guest_set_key = {
                            dublicate: true,
                            message: `code - ${code} already exists!`
                        }
                        new SendSocketMessage(socketChannels.GUEST_SET_KEY, send_guest_set_key, guest.company, send_data.user)
                    } else {
                        let credential = await Credential.findOne({ where: { cardholder: guest.id } })
                        const location = message.device_topic.split('/').slice(0, 2).join('/')
                        if (!credential) {
                            credential = await Credential.addItem({
                                company: guest.company,
                                cardholder: guest.id,
                                code: code
                            } as Credential)
                            guest.credentials = [credential]
                            CardKeyController.setAddCardKey(OperatorType.ADD_CARD_KEY, location, guest.company, send_data.user, null, [guest], null)
                        } else {
                            credential.code = code
                            await credential.save({ transaction: false })
                            CardKeyController.setAddCardKey(OperatorType.SET_CARD_KEYS, location, guest.company, send_data.user, null)
                        }
                        new SendSocketMessage(socketChannels.GUEST_SET_KEY, credential, guest.company, send_data.user)
                    }
                }
            } else {
                //
            }
        } catch (error) {
            // console.log('activateCredentialAck error', error)
        }
    }

    public static async mainTainAck (message: IMqttCrudMessaging) {
        // console.log('resetApbAck', message)
        if (message.result.errorNo === 0) {
            const topic = message.send_data.topic.split('/')
            const serial_number = +topic[3]
            const acu: any = await Acu.findOne({ where: { serial_number: serial_number, company: message.send_data.user_data.company } })
            if (message.send_data.data.main_tain === 'reset' || message.send_data.data.main_tain === 'reset_to_factory') {
                await Acu.destroyItem({ id: acu.id, company: acu.company })
            }
        }
    }

    public static async webPassAck (message: IMqttCrudMessaging) {
        // console.log('webPassAck', message)
        if (message.result.errorNo === 0) {

        }
    }
}
