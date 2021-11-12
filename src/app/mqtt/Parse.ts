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

export default class Parse {
    public static deviceData (topic: string, data: string) {
        try {
            const message: IMqttCrudMessaging = JSON.parse(data)

            message.location = message.device_topic.split('/').slice(0, 2).join('/')
            message.company = Number(message.device_topic.split('/')[1])
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
                    // if (error === 777) {
                    //     const notification = {
                    //         event: `Timeout ${topic} - ${message.operator}`,
                    //         description: JSON.stringify(message),
                    //         company: message.company
                    //     }
                    //     Notification.addItem(notification as Notification)
                    // }
                }
            }

            switch (message.operator) {
                case OperatorType.PING_ACK:
                case OperatorType.HEART_BIT:
                    this.pingAck(message)
                    break
                case OperatorType.REGISTRATION:
                    this.deviceRegistration(message)
                    break
                case OperatorType.CANCEL_REGISTRATION:
                    this.deviceCancelRegistration(message)
                    break
                case OperatorType.ACCEPT_ACK:
                    this.deviceAcceptAck(message)
                    break
                case OperatorType.LOGIN_ACK:
                    this.deviceLoginAck(message)
                    break
                case OperatorType.LOGOUT_ACK:
                    this.deviceLogOutAck(message)
                    break
                case OperatorType.LOGOUT_EVENT:
                    this.deviceLogOutEvent(message)
                    break
                case OperatorType.SET_PASS_ACK:

                    this.deviceSetPassAck(message)
                    break
                case OperatorType.SET_NET_SETTINGS_ACK:
                    this.deviceSetNetSettingsAck(message)
                    break
                case OperatorType.GET_NET_SETTINGS_ACK:
                    this.deviceGetNetSettingsAck(message)
                    break
                case OperatorType.SET_DATE_TIME_ACK:
                    this.deviceSetDateTimeAck(message)
                    break
                case OperatorType.SET_MQTT_SETTINGS_ACK:
                    this.deviceSetMqttSettingsAck(message)
                    break
                case OperatorType.GET_MQTT_SETTINGS_ACK:
                    this.deviceGetMqttSettingsAck(message)
                    break
                case OperatorType.GET_STATUS_ACU_ACK:
                    this.deviceGetStatusAcuAck(message)
                    break
                case OperatorType.SET_EXT_BRD_ACK:
                    this.deviceSetExtBrdAck(message)
                    break
                case OperatorType.GET_EXT_BRD_ACK:
                    this.deviceGetExtBrdAck(message)
                    break
                case OperatorType.DEL_EXT_BRD_ACK:
                    this.deviceDelExtBrdAck(message)
                    break

                case OperatorType.SET_RD_ACK:
                    this.deviceSetRdAck(message)
                    break
                case OperatorType.GET_RD_ACK:
                    this.deviceGetRdAck(message)
                    break
                case OperatorType.DEL_RD_ACK:
                    this.deviceDelRdAck(message)
                    break

                case OperatorType.SET_OUTPUT_ACK:
                    this.deviceSetOutputAck(message)
                    break
                case OperatorType.GET_OUTPUT_ACK:
                    this.deviceGetOutputAck(message)
                    break
                case OperatorType.GET_INPUT_ACK:
                    this.deviceGetInputAck(message)
                    break
                case OperatorType.SET_CTP_DOOR_ACK:
                    this.deviceSetCtpDoorAck(message)
                    break
                case OperatorType.DEL_CTP_DOOR_ACK:
                    this.deviceDelCtpDoorAck(message)
                    break
                case OperatorType.GET_CTP_DOOR_ACK:
                    this.deviceGetCtpDoorAck(message)
                    break

                case OperatorType.SET_CTP_TURNSTILE_ACK:
                    this.deviceSetCtpTurnstileAck(message)
                    break
                case OperatorType.DEL_CTP_TURNSTILE_ACK:
                    this.deviceDelCtpTurnstileAck(message)
                    break
                case OperatorType.GET_CTP_TURNSTILE_ACK:
                    this.deviceGetCtpTurnstileAck(message)
                    break
                case OperatorType.SET_CTP_GATE_ACK:
                    this.deviceSetCtpGateAck(message)
                    break
                case OperatorType.DEL_CTP_GATE_ACK:
                    this.deviceDelCtpGateAck(message)
                    break
                case OperatorType.GET_CTP_GATE_ACK:
                    this.deviceGetCtpGateAck(message)
                    break
                case OperatorType.SET_CTP_GATEWAY_ACK:
                    this.deviceSetCtpGatewayAck(message)
                    break
                case OperatorType.DEL_CTP_GATEWAY_ACK:
                    this.deviceDelCtpGatewayAck(message)
                    break
                case OperatorType.GET_CTP_GATEWAY_ACK:
                    this.deviceGetCtpGatewayAck(message)
                    break
                case OperatorType.SET_CTP_FLOOR_ACK:
                    this.deviceSetCtpFloorAck(message)
                    break
                case OperatorType.DEL_CTP_FLOOR_ACK:
                    this.deviceDelCtpFloorAck(message)
                    break
                case OperatorType.GET_CTP_FLOOR_ACK:
                    this.deviceGetCtpFloorAck(message)
                    break

                case OperatorType.EVENT:
                    this.deviceEvent(message)
                    break
                case OperatorType.SET_EVENTS_MOD_ACK:
                    this.deviceSetEventsModAck(message)
                    break
                case OperatorType.GET_EVENTS_MOD_ACK:
                    this.deviceGetEventsModAck(message)
                    break
                case OperatorType.GET_EVENTS_ACK:
                    this.deviceGetEventsAck(message)
                    break
                case OperatorType.SET_ACCESS_MODE_ACK:
                    this.deviceSetAccessModeAck(message)
                    break
                case OperatorType.GET_ACCESS_MODE_ACK:
                    this.deviceGetAccessModeAck(message)
                    break
                case OperatorType.SINGLE_PASS_ACK:
                    this.deviceSinglePassAck(message)
                    break
                case OperatorType.SET_CARD_KEYS_ACK:
                    this.setCardKeysAck(message)
                    break
                case OperatorType.ADD_CARD_KEY_ACK:
                    this.addCardKeyAck(message)
                    break
                case OperatorType.END_CARD_KEY_ACK:
                    this.endCardKeyAck(message)
                    break
                case OperatorType.EDIT_KEY_ACK:
                    this.editKeyAck(message)
                    break
                case OperatorType.DELL_KEYS_ACK:
                    this.dellKeysAck(message)
                    break
                case OperatorType.DELL_ALL_KEYS_ACK:
                    this.dellAllKeysAck(message)
                    break
                case OperatorType.SET_SDL_DAILY_ACK:
                    this.setSdlDailyAck(message)
                    break
                case OperatorType.DEL_SDL_DAILY_ACK:
                    this.delSdlDailyAck(message)
                    break
                case OperatorType.SET_SDL_WEEKLY_ACK:
                    this.setSdlWeeklyAck(message)
                    break
                case OperatorType.DEL_SDL_WEEKLY_ACK:
                    this.delSdlWeeklyAck(message)
                    break
                case OperatorType.SET_SDL_FLEXI_TIME_ACK:
                    this.setSdlFlexiTimeAck(message)
                    break
                case OperatorType.ADD_DAY_FLEXI_TIME_ACK:
                    this.addDayFlexiTimeAck(message)
                    break
                case OperatorType.END_SDL_FLEXI_TIME_ACK:
                    this.endSdlFlexiTimeAck(message)
                    break
                case OperatorType.DEL_SDL_FLEXI_TIME_ACK:
                    this.delSdlFlexiTimeAck(message)
                    break
                case OperatorType.DEL_DAY_FLEXI_TIME_ACK:
                    this.delDayFlexiTimeAck(message)
                    break
                case OperatorType.SET_SDL_SPECIFIED_ACK:
                    this.setSdlSpecifiedAck(message)
                    break
                case OperatorType.ADD_DAY_SPECIFIED_ACK:
                    this.addDaySpecifiedAck(message)
                    break
                case OperatorType.END_SDL_SPECIFIED_ACK:
                    this.endSdlSpecifiedAck(message)
                    break
                case OperatorType.DEL_SDL_SPECIFIED_ACK:
                    this.delSdlSpecifiedAck(message)
                    break
                case OperatorType.DELL_DAY_SPECIFIED_ACK:
                    this.dellDaySpecifiedAck(message)
                    break
                case OperatorType.DELL_SHEDULE_ACK:
                    this.dellSheduleAck(message)
                    break
                case OperatorType.DEV_TEST_ACK:
                    this.deviceDevTestAck(message)
                    break
                case OperatorType.SET_HEART_BIT_ACK:
                    this.setHeartBitAck(message)
                    break

                default:
                    break
            }
        } catch (error) {
            console.log('error deviceData', topic, data)
        }
    }

    public static async pingAck (message: IMqttCrudMessaging) {
        try {
            AcuStatus.findOneOrFail({ serial_number: message.device_id, company: message.company }).then(async (acuStatusData: AcuStatus) => {
                const access_point_statuses: any = await AccessPointStatus.getAllItems({ where: { acu: { '=': acuStatusData.acu } } })
                if (message.result.errorNo === 0) {
                    AcuStatus.updateItem(acuStatusData)
                    if (message.info) {
                        for (const access_point_status of access_point_statuses) {
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

                                    await AccessPointStatus.updateItem(access_point_status)
                                }
                            }
                        }
                    }
                }
            })
        } catch (error) {
            console.log('error pingack ', error)
        }
    }

    public static async deviceRegistration (message: IMqttCrudMessaging) {
        try {
            const device_id = message.info.device_id
            const acu = await Acu.findOne({ where: { serial_number: device_id, status: In([acuStatus.PENDING, acuStatus.ACTIVE]), company: message.company } })

            if (!(acu && acu.status === acuStatus.ACTIVE)) {
                const acu_data: any = acu || {}
                acu_data.name = message.info.name
                acu_data.description = message.info.note
                acu_data.serial_number = device_id
                acu_data.fw_version = message.info.firmware_ver
                acu_data.time = JSON.stringify({
                    time_zone: message.info.gmt,
                    timezone_from_facility: false,
                    enable_daylight_saving_time: false,
                    daylight_saving_time_from_user_account: false
                })
                acu_data.company = message.company
                await Acu.save(acu_data)
                // const user = message.send_data
                new SendDeviceMessage(OperatorType.ACCEPT, message.location, device_id, 'none')
                // console.log('success:true')
            }
        } catch (error) {
            console.log('error deviceRegistrion ', error)
        }
    }

    public static async deviceCancelRegistration (message: IMqttCrudMessaging) {
        // console.log('deviceCancelRegistration', message)
        if (message.result.errorNo === 0) {
            console.log('deviceCancelRegistration complete')
        } else {
        }
    }

    public static deviceAcceptAck (message: IMqttCrudMessaging) {
        // console.log('deviceAcceptAck', message)
        if (message.result.errorNo === 0) {
            // const company = message.company
            const device_id = message.device_id
            Acu.findOne({ serial_number: device_id /*, company: company */ }).then((acuData: Acu) => {
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
        const acu: Acu = await Acu.findOneOrFail({ serial_number: message.device_id /*, company: message.company */ })
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
            await acu.save()
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
            // const company = message.company
            const device_id = message.device_id
            const acu = await Acu.findOneOrFail({ serial_number: device_id /*, company: company */ })
            acu.session_id = '0'
            await acu.save()
            // this.login(message.topic)
        }
    }

    public static async deviceSetPassAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetPassAck', message)
        if (message.result.errorNo === 0) {
            // const company = message.company
            const device_id = message.device_id
            const acu = await Acu.findOne({ serial_number: device_id /*, company: company */ })
            if (acu) {
                acu.password = message.send_data.data.password
                await acu.save()
                new SendDeviceMessage(OperatorType.GET_NET_SETTINGS, message.location, message.device_id)
            } else {
                // console.log('error deviceSetPass', message)
            }
        }
    }

    public static async deviceLogOutEvent (message: IMqttCrudMessaging) {
        // console.log('deviceLogOutEvent', message)
        if (message.result.errorNo === 0) {
            // const company = message.company
            const device_id = message.device_id
            const acu: Acu = await Acu.findOneOrFail({ serial_number: device_id /*, company: company */ })
            if (acu) {
                acu.session_id = '0'
                await acu.save()
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
                const company = message.company
                const device_id = message.device_id
                const acu: any = await Acu.findOneOrFail({ serial_number: device_id /*, company: company */ })
                if (acu) {
                    const info = message.send_data.data
                    acu.network = {
                        connection_type: (info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET,
                        dhcp: info.dhcp,
                        fixed: !info.dhcp,
                        ip_address: info.ip_address,
                        subnet_mask: info.subnet_mask,
                        gateway: info.gateway,
                        dns_server: info.dns_server
                    }
                    const update_acu = await Acu.updateItem({ id: acu.id, network: acu.network } as Acu)
                    new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${Acu.name}/${update_acu.old.name}`, update_acu)
                    // console.log('deviceSetNetSettingsAck complete')
                } else {
                    // console.log('error deviceSetNetSettingsAck', message)
                }
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
                const acu: any = await Acu.findOne({ serial_number: device_id /*, company: company */ })

                if (acu) {
                    acu.network = JSON.stringify({
                        connection_type: (message.info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET,
                        connection_mod: (message.info.dhcp) ? 0 : 1,
                        ip_address: message.info.ip_address,
                        subnet_mask: message.info.mask,
                        gateway: message.info.Gate,
                        dns_server: message.info.DNS1
                    })
                    await acu.save()
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
            const acu: Acu = await Acu.findOneOrFail({ serial_number: device_id /*, company: company */ })
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
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
        const ind = message.send_data.data.answer_qty
        const reader_data = message.send_data.data.readers[ind]

        if (message.result.errorNo === 0) {
            const company = message.company
            if (reader_data.update) {
                const save = await Reader.updateItem(reader_data as Reader)
                const access_point = await AccessPoint.findOneOrFail({ where: { id: save.old.access_point }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${Reader.name}/${access_point.acus.name}/${access_point.name}/${readerTypes[save.old.type]}`, save)
                new SendSocketMessage(socketChannels.READER_UPDATE, save.new, message.company, message.send_data.user)
                if (save) {
                    // console.log('Reader update completed')
                }
            } else {
                const reader: any = await Reader.findOneOrFail({ where: { id: reader_data.id }, relations: ['access_points', 'access_points.acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CREATE, `${Reader.name}/${reader.access_points.acus.name}/${reader.access_points.name}/${readerTypes[reader.type]}`, { type: readerTypes[reader.type] })
                // console.log('Reader insert completed')
            }
        } else {
            if (!reader_data.update) {
                const reader: any = await Reader.findOneOrFail({ where: { id: reader_data.id }, relations: ['access_points', 'access_points.acus'] })
                await Reader.destroyItem({ id: reader_data.id /*, company: message.company */ })
                new SendSocketMessage(socketChannels.READER_DELETE, reader, message.company, message.send_data.user)
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
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
                const save = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                const acu = await Acu.findOneOrFail({ where: { id: save.old.acu } })
                const access_point: any = await AccessPoint.findOneOrFail({ where: { id: save.new.id }, relations: ['acus'] })
                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.CHANGE, `${AccessPoint.name}/${acu.name}/${save.old.name}`, save)
                if (!message.send_data.data.readers) {
                    new SendSocketMessage(socketChannels.ACCESS_POINT_UPDATE, access_point, message.company, message.send_data.user)
                }
                if (save) {
                    console.log('AccessPoint update completed')
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
        console.log('deviceDelCtpDoorAck', message)
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
        if (message.result.errorNo === 0 || message.result.errorNo === 11) {
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
            console.log('deviceEvent')
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
            // const company = message.company
            const access_point = await AccessPoint.findOneOrFail({ where: { id: message.send_data.data.id /*, company: company */ } })
            if (message.send_data.data.mode) access_point.mode = message.send_data.data.mode
            if (message.send_data.data.exit_mode) access_point.exit_mode = message.send_data.data.exit_mode
            AccessPoint.save(access_point)
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
            console.log('setCardKeysAck complete')
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
            console.log('editKeyAck complete')
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
            // const acu: any = await Acu.findOne({ serial_number: message.device_id, company: message.company })

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
            console.log('delSdlDailyAck error', error)
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
            if (message.send_data.update) {
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
            if (message.send_data.update) {
                const access_rule = await AccessRule.findOneOrFail({ where: { id: message.send_data.data.id }, relations: ['access_points'] })
                await AccessRule.destroyItem({ id: message.send_data.data.id /*, company: message.company */ })

                new SendUserLogMessage(company, message.send_data.user_data, logUserEvents.DELETE, `${AccessRule.name}/${access_rule.access_points.name}`, { name: access_rule.access_points.name })
                checkAndDeleteAccessRight(message.send_data.data, message.company, message.send_data.user_data)
                // console.log('dellSheduleAck complete')
            }
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
        const acu = await Acu.findOneOrFail({ serial_number: message.device_id /*, company: message.company */ })

        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                let operator: OperatorType = OperatorType.SET_SDL_DAILY
                if (message.send_data.data.schedule_type === scheduleType.WEEKLY) {
                    operator = OperatorType.SET_SDL_WEEKLY
                } else if (message.send_data.data.schedule_type === scheduleType.FLEXITIME) {
                    operator = OperatorType.SET_SDL_FLEXI_TIME
                } else if (message.send_data.data.schedule_type === scheduleType.SPECIFIC) {
                    operator = OperatorType.SET_SDL_SPECIFIED
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
            const acu = await Acu.findOneOrFail({ serial_number: message.device_id, company: message.company })
            if (!acu.heart_bit) {
                acu.heart_bit = true
                acu.save()
            }
        } else {
        }
    }
}
