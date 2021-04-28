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
import { accessPointType } from '../enums/accessPointType.enum'
import LogController from '../controller/LogController'
import SendSocketMessage from './SendSocketMessage'
import { socketChannels } from '../enums/socketChannels.enum'
import { Cardholder } from '../model/entity'
import errorList from '../model/entity/errorList.json'

// import { uid } from 'uid'

export default class Parse {
    public static deviceData (topic: string, data: string) {
        const message: IMqttCrudMessaging = JSON.parse(data)
        message.location = message.device_topic.split('/').slice(0, 2).join('/')
        message.company = Number(message.device_topic.split('/')[1])
        message.device_id = Number(message.device_topic.split('/')[3])

        if ('result' in message && 'errorNo' in message.result) {
            const error: number = Number(message.result.errorNo)
            if (error !== 0) {
                const user = message.send_data.user
                const error_list: any = errorList
                if (error_list[error]) {
                    message.send_data.data.error_description = error_list[error].description
                } else {
                    message.send_data.data.error_description = 'Unknown Error'
                }
                new SendSocketMessage(socketChannels.ERROR_CHANNEL, message.send_data.data, message.company, user)
            }
        }

        switch (message.operator) {
            case OperatorType.REGISTRATION:
                this.deviceRegistration(message)
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

            default:
                break
        }
    }

    public static async deviceRegistration (message: IMqttCrudMessaging) {
        try {
            const acu_data: any = {}
            acu_data.name = message.info.name
            acu_data.description = message.info.note
            acu_data.serial_number = message.info.device_id
            acu_data.fw_version = message.info.firmware_ver
            acu_data.time = JSON.stringify({
                time_zone: acu_data.gmt,
                timezone_from_facility: false,
                enable_daylight_saving_time: false,
                daylight_saving_time_from_user_account: false
            })
            acu_data.company = message.company

            await Acu.addItem(acu_data)
            // const user = message.send_data
            new SendDeviceMessage(OperatorType.ACCEPT, message.location, message.device_id, 'none')
            // console.log('success:true')
        } catch (error) {
            // console.log('error deviceRegistrion ', error)
        }
    }

    public static deviceAcceptAck (message: IMqttCrudMessaging) {
        // console.log('deviceAcceptAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            const device_id = message.device_id
            Acu.findOne({ serial_number: device_id, company: company }).then((acuData: Acu) => {
                // when admin deleted this acu what we do ???
                const send_data: any = {
                    username: acuData.username ? acuData.username : 'admin',
                    password: acuData.password ? acuData.password : ''
                }
                new SendDeviceMessage(OperatorType.LOGIN, message.location, message.device_id, send_data, message.send_data.user, message.session_id)
            })
        }
    }

    public static async deviceLoginAck (message: IMqttCrudMessaging) {
        // console.log('deviceLoginAck', message)
        if (message.result.errorNo === 0) {
            const acu: Acu = await Acu.findOneOrFail({ serial_number: message.device_id, company: message.company })
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
        }
    }

    public static async deviceLogOutAck (message: IMqttCrudMessaging) {
        // console.log('deviceLogOutAck', message)
        if (message.result.errorNo === 0) {
            // console.log('logout complete')
            const company = message.company
            const device_id = message.device_id
            const acu = await Acu.findOneOrFail({ serial_number: device_id, company: company })
            acu.session_id = '0'
            await acu.save()
            // this.login(message.topic)
        }
    }

    public static async deviceSetPassAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetPassAck', message)
        if (message.result.errorNo === 0) {
            const company = message.company
            const device_id = message.device_id
            const acu = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                acu.password = message.send_data.data.password
                await acu.save()
                // console.log('deviceSetPass complete')
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
            const acu: Acu = await Acu.findOneOrFail({ serial_number: device_id, company: company })
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
                const acu: any = await Acu.findOneOrFail({ serial_number: device_id, company: company })
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
                    await Acu.updateItem({ id: acu.id, network: acu.network } as Acu)
                    // console.log('deviceSetNetSettingsAck complete')
                } else {
                    // console.log('error deviceSetNetSettingsAck', message)
                }
            }
        } catch (error) {
            // console.log('error deviceSetNetSettingsAck', error)
        }
    }

    public static deviceGetNetSettingsAck (message: any): void {
        // {
        //     "operator": "GetNetSettings-Ack",
        //     "session_Id": "1111111111",
        //     "message_Id": "222222222222",
        //     "info":
        //         {
        //         "Use_DHCP":true,
        //         "Time_Ap_On":0,
        //         "Local_Ip_Address":"192.168.1.100",
        //         "Local_Port":3777,
        //         "Mask":"255.255.255.0",
        //         "Gate":"192.168.1.1",
        //         "DNS1":"192.168.1.1",
        //         "DNS2":"8.8.8.8",
        //         "NTP1":"pool.ntp.org",
        //         "NTP2":"pool2.ntp.org:123",
        //         "GMT":6,
        //         "DST_GMT": false,
        //         "DST_Start":1583636400,
        //         "DST_End":1604196000,
        //         "DST_Shift":3600,
        //         "AP_SSID":"LmWf123456789",
        //         "AP_PASS":"123456",
        //         "HideSSID":false,
        //         },
        //     "result":
        //              {
        //               "errorNo":0,
        //               "description":"ok",
        //               "time": 1599904641
        //              },
        //     "topic": "587123122/5/Registration/123456789/Operate/Ack"
        // }
    }

    public static async deviceSetDateTimeAck (message: IMqttCrudMessaging) {
        if (message.result.errorNo === 0) {
            const company = message.company
            const device_id = message.device_id
            const acu: Acu = await Acu.findOneOrFail({ serial_number: device_id, company: company })
            if (acu) {
                acu.time = JSON.stringify(message.send_data.data)
                await Acu.updateItem({ id: acu.id, network: acu.network } as Acu)
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
            if (message.send_data.update) {
                const save = await ExtDevice.updateItem(message.send_data.data as ExtDevice)
                if (save) {
                    // console.log('ExtDevice update completed')
                }
            } else {
                // console.log('ExtDevice insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await ExtDevice.destroyItem({ id: message.send_data.data.id })
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
        if (message.result.errorNo === 0) {
            await ExtDevice.destroyItem({ id: message.send_data.data.id })
            // console.log('DelExtDevice complete')
        }
    }

    public static async deviceSetRdAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetRd', message)
        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                const access_point: any = {
                    id: message.send_data.data.access_point,
                    readers: message.send_data.data
                }
                if (message.send_data.data.access_point_type === accessPointType.DOOR) {
                    new SendDeviceMessage(OperatorType.SET_CTP_DOOR, message.location, message.device_id, message.session_id, access_point)
                    // } else if (message.send_data.data.access_point_type === accessPointType.GATE) {
                    // new SendDeviceMessage(OperatorType.SET_CTP_GATE, message.location, message.device_id, message.session_id, access_point)
                    // } else if (message.send_data.data.access_point_type === accessPointType.GATEWAY) {
                    // new SendDeviceMessage(OperatorType.SET_CTP_GATEWAY, message.location, message.device_id, message.session_id, access_point)
                    // } else if (message.send_data.data.access_point_type === accessPointType.FLOOR) {
                    // new SendDeviceMessage(OperatorType.SET_CTP_FLOOR, message.location, message.device_id, message.session_id, access_point)
                    // } else if (message.send_data.data.access_point_type === accessPointType.TURNSTILE) {
                    // new SendDeviceMessage(OperatorType.SET_CTP_TURNSTILE, message.location, message.device_id, message.session_id, access_point)
                    // }
                }
                const save = await Reader.updateItem(message.send_data.data as Reader)
                if (save) {
                    // console.log('Reader update completed')
                }
            } else {
                // console.log('Reader insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await Reader.destroyItem({ id: message.send_data.data.id })
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
        if (message.result.errorNo === 0) {
            await Reader.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceDelRdAck complete')
            const access_point: any = {
                id: message.send_data.data.access_point,
                readers: message.send_data.data
            }
            if (message.send_data.data.access_point_type === accessPointType.DOOR) {
                new SendDeviceMessage(OperatorType.SET_CTP_DOOR, message.location, message.device_id, message.session_id, access_point)
                // } else if (message.send_data.data.access_point_type === accessPointType.GATE) {
                // new SendDeviceMessage(OperatorType.SET_CTP_GATE, message.location, message.device_id, message.session_id, access_point)
                // } else if (message.send_data.data.access_point_type === accessPointType.GATEWAY) {
                // new SendDeviceMessage(OperatorType.SET_CTP_GATEWAY, message.location, message.device_id, message.session_id, access_point)
                // } else if (message.send_data.data.access_point_type === accessPointType.FLOOR) {
                // new SendDeviceMessage(OperatorType.SET_CTP_FLOOR, message.location, message.device_id, message.session_id, access_point)
                // } else if (message.send_data.data.access_point_type === accessPointType.TURNSTILE) {
                // new SendDeviceMessage(OperatorType.SET_CTP_TURNSTILE, message.location, message.device_id, message.session_id, access_point)
                // }
            }
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
            if (message.send_data.update) {
                const save = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                if (save) {
                    console.log('AccessPoint update completed')
                }
            } else {
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id })
            }
        }
    }

    public static async deviceDelCtpDoorAck (message: IMqttCrudMessaging) {
        console.log('deviceDelCtpDoorAck', message)
        if (message.result.errorNo === 0) {
            // await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceDelCtpDoorAck delete completed')

        }
    }

    public static async deviceGetCtpDoorAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceGetCtpTurnstileAck insert completed')
        }
    }

    public static async deviceSetCtpTurnstileAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id })
            }
        }
    }

    public static async deviceDelCtpTurnstileAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceDelCtpDoorAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpTurnstileAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpTurnstileAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceGetCtpTurnstileAck insert completed')
        } else {
        }
    }

    public static async deviceSetCtpGateAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpGateAck', message)
        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id })
            }
        }
    }

    public static async deviceDelCtpGateAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpGateAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceDelCtpGateAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpGateAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpGateAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceGetCtpGateAck insert completed')
        } else {
        }
    }

    public static async deviceSetCtpGatewayAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpGatewayAck', message)
        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id })
            }
        }
    }

    public static async deviceDelCtpGatewayAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpGatewayAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceDelCtpGatewayAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpGatewayAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpGatewayAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceGetCtpGatewayAck insert completed')
        } else {
        }
    }

    public static async deviceSetCtpFloorAck (message: IMqttCrudMessaging) {
        // console.log('deviceSetCtpFloorAck', message)
        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                const save: any = await AccessPoint.updateItem(message.send_data.data as AccessPoint)
                if (save) {
                    // console.log('AccessPoint update completed')
                }
            } else {
                // console.log('AccessPoint insert completed')
            }
        } else {
            if (!message.send_data.update) {
                await AccessPoint.destroyItem({ id: message.send_data.data.id })
            }
        }
    }

    public static async deviceDelCtpFloorAck (message: IMqttCrudMessaging) {
        // console.log('deviceDelCtpFloorAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
            // console.log('deviceDelCtpFloorAck insert completed')
        } else {
        }
    }

    public static async deviceGetCtpFloorAck (message: IMqttCrudMessaging) {
        // console.log('deviceGetCtpFloorAck', message)
        if (message.result.errorNo === 0) {
            await AccessPoint.destroyItem({ id: message.send_data.data.id })
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

    public static deviceSetAccessModeAck (message: IMqttCrudMessaging): void {
        // console.log('deviceSetAccessModeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('deviceSetAccessModeAck complete')
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
            await Cardholder.destroyItem({ id: message.send_data.data.id })
        }
    }

    public static async addCardKeyAck (message: IMqttCrudMessaging) {
        // console.log('addCardKeyAck', message)
        if (message.result.errorNo === 0) {
            // console.log('addCardKeyAck complete')
        } else {
            await Cardholder.destroyItem({ id: message.send_data.data.id })
        }
    }

    public static async endCardKeyAck (message: IMqttCrudMessaging) {
        // console.log('endCardKeyAck', message)
        if (message.result.errorNo === 0) {
            // console.log('endCardKeyAck complete')
        } else {
            await Cardholder.destroyItem({ id: message.send_data.data.id })
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
        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                await AccessRule.updateItem(message.send_data.data as AccessRule)
            }
            // console.log('setSdlDailyAck complete')
        } else {
            if (!message.send_data.update) {
                await AccessRule.destroyItem({ id: message.send_data.data.id })
            }
        }
    }

    public static async delSdlDailyAck (message: IMqttCrudMessaging) {
        // console.log('delSdlDailyAck', message)
        // const acu: any = await Acu.findOne({ serial_number: message.device_id, company: message.company })

        if (message.result.errorNo === 0) {
            if (!message.send_data.update) {
                await AccessRule.destroyItem({ id: message.send_data.data.id })
                // console.log('dellSheduleAck complete')
            }
        } else {
        }
    }

    public static async setSdlWeeklyAck (message: IMqttCrudMessaging) {
        // console.log('setSdlWeeklyAck', message)
        if (message.result.errorNo === 0) {
            await AccessRule.updateItem(message.send_data.data as AccessRule)
            // console.log('setSdlWeeklyAck complete')
        } else {
            await AccessRule.destroyItem({ id: message.send_data.data.id })
        }
    }

    public static async delSdlWeeklyAck (message: IMqttCrudMessaging) {
        // console.log('delSdlWeeklyAck', message)

        if (message.result.errorNo === 0) {
            if (!message.send_data.update) {
                await AccessRule.destroyItem({ id: message.send_data.data.id })
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
            message.send_data.data.adds_count = 0
            new SendDeviceMessage(OperatorType.ADD_DAY_FLEXI_TIME, message.location, message.device_id, message.send_data, user, message.session_id)
        }
    }

    public static async addDayFlexiTimeAck (message: IMqttCrudMessaging) {
        // console.log('addDayFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('addDayFlexiTimeAck complete')
            const set_params = message.send_data.data.set_params
            set_params.adds_count++
            const user = message.send_data.user
            if (set_params.adds_count === set_params.info.DaysCount) {
                new SendDeviceMessage(OperatorType.END_SDL_FLEXI_TIME, message.location, message.device_id, set_params, user, message.session_id)
            } else {
                new SendDeviceMessage(OperatorType.ADD_DAY_FLEXI_TIME, message.location, message.device_id, set_params, user, message.session_id)
            }
        } else {
        }
    }

    public static endSdlFlexiTimeAck (message: IMqttCrudMessaging): void {
        // console.log('endSdlFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            // console.log('endSdlFlexiTimeAck complete')
        } else {
        }
    }

    public static async delSdlFlexiTimeAck (message: IMqttCrudMessaging) {
        // console.log('delSdlFlexiTimeAck', message)

        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                await AccessRule.destroyItem({ id: message.send_data.data.id })
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
        } else {
        }
    }

    public static addDaySpecifiedAck (message: IMqttCrudMessaging): void {
        // console.log('addDaySpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('addDaySpecifiedAck complete')
        } else {
        }
    }

    public static endSdlSpecifiedAck (message: IMqttCrudMessaging): void {
        // console.log('endSdlSpecifiedAck', message)
        if (message.result.errorNo === 0) {
            // console.log('endSdlSpecifiedAck complete')
        } else {
        }
    }

    public static async delSdlSpecifiedAck (message: IMqttCrudMessaging) {
        // console.log('delSdlSpecifiedAck', message)

        if (message.result.errorNo === 0) {
            if (message.send_data.update) {
                await AccessRule.destroyItem({ id: message.send_data.data.id })
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
        const acu = await Acu.findOneOrFail({ serial_number: message.device_id, company: message.company })

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

                new SendDeviceMessage(operator, message.location, acu.serial_number, message.send_data, user, acu.session_id)
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
}
