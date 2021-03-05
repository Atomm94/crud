import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'
import SendDevice from './SendDevice'
import { acuConnectionType } from '../enums/acuConnectionType.enum'

import { scheduleType } from '../enums/scheduleType.enum'
import { AccessRule } from '../model/entity/AccessRule'
import { AccessPoint } from '../model/entity/AccessPoint'
import { ExtDevice } from '../model/entity/ExtDevice'
import SendDeviceMessage from './SendDeviceMessage'
import { IMqttCrudMessaging } from '../Interfaces/messaging.interface'

export default class Parse {
    public static deviceData (topic: string, data: string) {
        const message: IMqttCrudMessaging = JSON.parse(data)
        message.location = message.device_topic.split('/').slice(0, 2).join('/')
        message.company = Number(message.device_topic.split('/')[1])
        message.device_id = Number(message.device_topic.split('/')[3])
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
            case OperatorType.SET_RD_ACK:
                this.deviceSetRdAck(message)
                break
            case OperatorType.GET_RD_ACK:
                this.deviceGetRdAck(message)
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
            case OperatorType.EVENT:
                this.deviceEvent(message)
                break
            case OperatorType.SET_EVENTS_MOD_ACK:
                this.deviceSetEventsModAck(topic)
                break
            case OperatorType.GET_EVENTS_MOD_ACK:
                this.deviceGetEventsModAck(topic)
                break
            case OperatorType.GET_EVENTS_ACK:
                this.deviceGetEventsAck(topic)
                break
            case OperatorType.SET_ACCESS_MODE_ACK:
                this.deviceSetAccessModeAck(topic)
                break
            case OperatorType.GET_ACCESS_MODE_ACK:
                this.deviceGetAccessModeAck(topic)
                break
            case OperatorType.SINGLE_PASS_ACK:
                this.deviceSinglePassAck(topic)
                break
            case OperatorType.SET_CARD_KEYS_ACK:
                this.setCardKeysAck(message)
                break
            case OperatorType.ADD_CARD_KEY_ACK:
                this.addCardKeyAck(message)
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
                this.deviceDevTestAck(topic)
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
            // SendDevice.accept(message.topic)
            new SendDeviceMessage(OperatorType.ACCEPT, message.location, message.device_id, 'none')
            console.log('success:true')
        } catch (error) {
            console.log('error deviceRegistrion ', error)
        }
    }

    public static deviceAcceptAck (message: any) {
        console.log('deviceAcceptAck', message)
        if (message.result.errorNo === 0) {
            const company = Number(message.topic.split('/')[1])
            const device_id = message.topic.split('/')[3]
            Acu.findOne({ serial_number: device_id, company: company }).then((acuData: Acu) => {
                // when admin deleted this acu what we do ???
                const send_data: any = {
                    username: acuData.username ? acuData.username : 'admin',
                    password: acuData.password ? acuData.password : ''
                }
                new SendDeviceMessage(OperatorType.LOGIN, send_data, message.topic)
            })
        }
    }

    public static async deviceLoginAck (message: IMqttCrudMessaging) {
        console.log('deviceLoginAck', message)
        if (message.result.errorNo === 0) {
            const acu: any = await Acu.findOne({ serial_number: message.device_id, company: message.company })
            if (acu) {
                if (acu.session_id == null) {
                    // const generate_pass = uid(32)
                    // Add save password in db
                    // Add save password in db
                    // Add save password in db
                    // Add save password in db
                    const send_data = {
                        username: 'admin',
                        password: 'admin',
                        use_sha: 0
                    }
                    new SendDeviceMessage(OperatorType.SET_PASS, message.location, message.device_id, send_data)
                }
                acu.session_id = message.session_id
                await acu.save()
                console.log('login complete')
            } else {
                console.log('error deviceLoginAck', message)
            }
        }
    }

    public static async deviceLogOutAck (message: any) {
        console.log('deviceLogOutAck', message)
        if (message.result.errorNo === 0) {
            console.log('logout complete')
            const company = Number(message.topic.split('/')[1])
            const device_id = message.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            acu.session_id = '0'
            await acu.save()
            // this.login(message.topic)
        }
    }

    public static async deviceSetPassAck (message: any) {
        console.log('deviceSetPassAck', message)
        if (message.result.errorNo === 0) {
            const company = Number(message.topic.split('/')[1])
            const device_id = Number(message.topic.split('/')[3])
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                acu.password = message.send_data.info.password
                await acu.save()
                console.log('deviceSetPass complete')
            } else {
                console.log('error deviceSetPass', message)
            }
        }
    }

    public static async deviceLogOutEvent (message: any) {
        console.log('deviceLogOutEvent', message)
        if (message.result.errorNo === 0) {
            const company = Number(message.topic.split('/')[1])
            const device_id = message.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                acu.session_id = '0'
                await acu.save()
                SendDevice.login(message.topic)
                console.log('deviceLogOutEvent complete')
            } else {
                console.log('error deviceLogOutEvent', message)
            }
        }
    }

    public static async deviceSetNetSettingsAck (message: any) {
        // "operator":" SetNetSettings -Ack",
        // "session_Id": 1111111111,
        // "message_Id": 3333333333,
        // "info":"none",
        // "result":
        //             {
        //            "errorNo":0,
        //            "description":"ok",
        //            "time": 1599904641
        //             }
        // }

        console.log('deviceSetNetSettingsAck', message)
        try {
            if (message.result.errorNo === 0) {
                const company = Number(message.topic.split('/')[1])
                const device_id = message.topic.split('/')[3]
                const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
                if (acu) {
                    const info = message.send_data.info
                    const dhcp = (info.connection_mod === 0)
                    acu.network = {
                        connection_type: (info.connection_type === 0) ? acuConnectionType.WI_FI : acuConnectionType.ETHERNET,
                        dhcp: dhcp,
                        fixed: !dhcp,
                        ip_address: info.ip_address,
                        subnet_mask: info.mask,
                        gateway: info.Gate,
                        dns_server: info.DNS1
                    }
                    await Acu.updateItem({ id: acu.id, network: acu.network } as Acu)
                    console.log('deviceSetNetSettingsAck complete')
                } else {
                    console.log('error deviceSetNetSettingsAck', message)
                }
            }
        } catch (error) {
            console.log('error deviceSetNetSettingsAck', error)
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

    public static async deviceSetDateTimeAck (message: any) {
        // receive message from mqtt
        // {
        //     "operator": "SetDateTime-Ack",
        //     "sessionId": "1111111111",
        //     "messageId": "222222222222",
        //     "info": "none",
        //     "result":
        //     {
        //         "errorNo": 0,
        //         "description": "ok",
        //         "time": 1583636403
        //     },
        //     "topic": "587123122/5/Registration/123456789/Operate/Ack"
        // }
        console.log('deviceSetDateTimeAck')

        if (message.result.errorNo === 0) {
            const company = Number(message.topic.split('/')[1])
            const device_id = message.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                const info = message.send_data.info
                acu.time = JSON.stringify({
                    time_zone: info.GMT,
                    // ?????????????
                    timezone_from_facility: false,
                    enable_daylight_saving_time: false,
                    daylight_saving_time_from_user_account: false
                })
                await Acu.updateItem({ id: acu.id, network: acu.network } as Acu)
                console.log('deviceSetDateTimeAck complete')
            } else {
                console.log('error deviceSetDateTimeAck', message)
            }
        }
    }

    public static deviceSetMqttSettingsAck (message: any): void {
        console.log('deviceSetMqttSettingsAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceSetMqttSettingsAck complete')
        }
    }

    public static deviceGetMqttSettingsAck (message: any): void {
        console.log('deviceGetMqttSettingsAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetMqttSettingsAck complete')
        }
    }

    public static deviceGetStatusAcuAck (message: any): void {
        console.log('deviceGetStatusAcuAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetStatusAcuAck complete')
        }
    }

    public static async deviceSetExtBrdAck (data: any) {
        console.log('deviceSetExtBrdAck', data)
        if (data.result.errorNo === 0) {
            console.log('ssss', data.send_data)
            const save: any = await ExtDevice.updateItem(data.send_data as ExtDevice)
            if (save) {
                console.log('ExtDevice insert completed')
            }
        }
    }

    public static deviceGetExtBrdAck (data: any) {
        console.log('deviceGetExtBrdAck', data)
        if (data.result.errorNo === 0) {
            console.log('ExtDevice complete')
        }
    }

    public static deviceSetRdAck (message: any): void {
        console.log('deviceSetRd', message)
        if (message.result.errorNo === 0) {
            console.log('deviceSetRd complete')
        }
    }

    public static deviceGetRdAck (message: any): void {
        console.log('deviceGetRdAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetRdAck complete')
        }
    }

    public static deviceSetOutputAck (message: any): void {
        console.log('deviceGetRdAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetRdAck complete')
        }
    }

    public static deviceGetOutputAck (message: any): void {
        console.log('deviceGetOutputAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetOutputAck complete')
        }
    }

    public static deviceGetInputAck (message: any): void {
        console.log('deviceGetInputAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetInputAck complete')
        }
    }

    public static async deviceSetCtpDoorAck (message: any) {
        console.log('deviceSetCtpDoorAck', message)
        if (message.result.errorNo === 0) {
            const save: any = await AccessPoint.addItem(message.send_data as AccessPoint)
            if (save) {
                console.log('deviceSetCtpDoor insert completed')
            }
        }
    }

    public static async deviceDelCtpDoorAck (message: any) {
        console.log('deviceDelCtpDoorAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceDelCtpDoorAck insert completed')
        }
    }

    public static deviceEvent (message: any): void {
        console.log('deviceEvent', message)
        if (message.result.errorNo === 0) {
            console.log('deviceEvent complete')
        }
    }

    public static deviceSetEventsModAck (message: any): void {
        console.log('deviceSetEventsModAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceSetEventsModAck complete')
        }
    }

    public static deviceGetEventsModAck (message: any): void {
        console.log('deviceGetEventsModAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetEventsModAck complete')
        }
    }

    public static deviceGetEventsAck (message: any): void {
        console.log('deviceGetEventsAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetEventsAck complete')
        }
    }

    public static deviceSetAccessModeAck (message: any): void {
        console.log('deviceSetAccessModeAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceSetAccessModeAck complete')
        }
    }

    public static deviceGetAccessModeAck (message: any): void {
        console.log('deviceGetAccessModeAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceGetAccessModeAck complete')
        }
    }

    public static deviceSinglePassAck (message: any): void {
        console.log('deviceSinglePassAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceSinglePassAck complete')
        }
    }

    public static setCardKeysAck (message: any): void {
        console.log('setCardKeysAck', message)
        if (message.result.errorNo === 0) {
            console.log('setCardKeysAck complete')
        }
    }

    public static addCardKeyAck (message: any): void {
        console.log('addCardKeyAck', message)
        if (message.result.errorNo === 0) {
            console.log('addCardKeyAck complete')
        }
    }

    public static editKeyAck (message: any): void {
        console.log('editKeyAck', message)
        if (message.result.errorNo === 0) {
            console.log('editKeyAck complete')
        }
    }

    public static dellKeysAck (message: any): void {
        console.log('dellKeysAck', message)
        if (message.result.errorNo === 0) {
            console.log('dellKeysAck complete')
        }
    }

    public static dellAllKeysAck (message: any): void {
        console.log('dellAllKeysAck', message)
        if (message.result.errorNo === 0) {
            console.log('dellAllKeysAck complete')
        }
    }

    public static async setSdlDailyAck (message: IMqttCrudMessaging) {
        console.log('setSdlDailyAck', message)
        if (message.result.errorNo === 0) {
            if (message.send_data.data.schedule_type) {
                await AccessRule.updateItem(message.send_data.data as AccessRule)
            }
            console.log('setSdlDailyAck complete')
        } else {
            if (!message.send_data.data.schedule_type) {
                await AccessRule.destroyItem(message.send_data.data.id)
            }
        }
    }

    public static async delSdlDailyAck (message: IMqttCrudMessaging) {
        console.log('delSdlDailyAck', message)
        // const acu: any = await Acu.findOne({ serial_number: message.device_id, company: message.company })

        if (message.result.errorNo === 0) {
            await AccessRule.destroyItem(message.send_data.data.id)
        }
    }

    public static async setSdlWeeklyAck (message: IMqttCrudMessaging) {
        console.log('setSdlWeeklyAck', message)
        if (message.result.errorNo === 0) {
            await AccessRule.updateItem(message.send_data.data as AccessRule)
            console.log('setSdlWeeklyAck complete')
        } else {
            await AccessRule.destroyItem(message.send_data.data.schedule)
        }
    }

    public static async delSdlWeeklyAck (message: IMqttCrudMessaging) {
        console.log('delSdlWeeklyAck', message)

        if (message.result.errorNo === 0) {
            await AccessRule.destroyItem(message.send_data.data.id)
        }
    }

    public static async setSdlFlexiTimeAck (message: IMqttCrudMessaging) {
        console.log('setSdlFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            console.log('setSdlFlexiTimeAck complete')
            message.send_data.data.adds_count = 0
            new SendDeviceMessage(OperatorType.ADD_DAY_FLEXI_TIME, message.location, message.device_id, message.send_data, message.session_id)
        }
    }

    public static async addDayFlexiTimeAck (message: IMqttCrudMessaging) {
        console.log('addDayFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            console.log('addDayFlexiTimeAck complete')
            const set_params = message.send_data.data.set_params
            set_params.adds_count++
            if (set_params.adds_count === set_params.info.DaysCount) {
                new SendDeviceMessage(OperatorType.END_SDL_FLEXI_TIME, message.location, message.device_id, set_params, message.session_id)
            } else {
                new SendDeviceMessage(OperatorType.ADD_DAY_FLEXI_TIME, message.location, message.device_id, set_params, message.session_id)
            }
        }
    }

    public static endSdlFlexiTimeAck (message: any): void {
        console.log('endSdlFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            console.log('endSdlFlexiTimeAck complete')
        }
    }

    public static async delSdlFlexiTimeAck (message: IMqttCrudMessaging) {
        console.log('delSdlFlexiTimeAck', message)

        if (message.result.errorNo === 0) {
            await AccessRule.destroyItem(message.send_data.data.id)
        }
    }

    public static delDayFlexiTimeAck (message: any): void {
        console.log('delDayFlexiTimeAck', message)
        if (message.result.errorNo === 0) {
            console.log('delDayFlexiTimeAck complete')
        }
    }

    public static setSdlSpecifiedAck (message: any): void {
        console.log('setSdlSpecifiedAck', message)
        if (message.result.errorNo === 0) {
            console.log('setSdlSpecifiedAck complete')
        }
    }

    public static addDaySpecifiedAck (message: any): void {
        console.log('addDaySpecifiedAck', message)
        if (message.result.errorNo === 0) {
            console.log('addDaySpecifiedAck complete')
        }
    }

    public static endSdlSpecifiedAck (message: any): void {
        console.log('endSdlSpecifiedAck', message)
        if (message.result.errorNo === 0) {
            console.log('endSdlSpecifiedAck complete')
        }
    }

    public static async delSdlSpecifiedAck (message: IMqttCrudMessaging) {
        console.log('delSdlSpecifiedAck', message)

        if (message.result.errorNo === 0) {
            await AccessRule.destroyItem(message.send_data.data.id)
        }
    }

    public static dellDaySpecifiedAck (message: any): void {
        console.log('dellDaySpecifiedAck', message)
        if (message.result.errorNo === 0) {
            console.log('dellDaySpecifiedAck complete')
        }
    }

    public static async dellSheduleAck (message: IMqttCrudMessaging) {
        console.log('dellSheduleAck', message)
        const acu: any = await Acu.findOne({ serial_number: message.device_id, company: message.company })

        if (message.result.errorNo === 0) {
            if (message.send_data.data.schedule_type) {
                let operator: OperatorType = OperatorType.SET_SDL_DAILY
                if (message.send_data.data.schedule_type === scheduleType.WEEKLY) {
                    operator = OperatorType.SET_SDL_WEEKLY
                } else if (message.send_data.data.schedule_type === scheduleType.FLEXITIME) {
                    operator = OperatorType.SET_SDL_FLEXI_TIME
                } else if (message.send_data.data.schedule_type === scheduleType.SPECIFIC) {
                    operator = OperatorType.SET_SDL_SPECIFIED
                }
                new SendDeviceMessage(operator, message.location, acu.serial_number, message.send_data, acu.session_id)
                console.log('dellSheduleAck complete')
            }
        }
    }

    public static deviceDevTestAck (message: any): void {
        console.log('deviceDevTestAck', message)
        if (message.result.errorNo === 0) {
            console.log('deviceDevTestAck complete')
        }
    }
}
