import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'
import SendDevice from './SendDevice'
import { acuConnectionType } from '../enums/acuConnectionType.enum'

export default class Parse {
    public static deviceData (topic: string, message: string) {
        const data = JSON.parse(message)
        switch (data.operator) {
            case OperatorType.REGISTRATION:
                this.deviceRegistration(topic, data)
                break
            case OperatorType.ACCEPT_ACK:
                this.deviceAcceptAck(data)
                break
            case OperatorType.LOGIN_ACK:
                this.deviceLoginAck(data)
                break
            case OperatorType.LOGOUT_ACK:
                this.deviceLogOutAck(data)
                break
            case OperatorType.LOGOUT_EVENT:
                this.deviceLogOutEvent(data)
                break
            case OperatorType.SET_PASS_ACK:
                this.deviceSetPassAck(data)
                break
            case OperatorType.SET_NET_SETTINGS_ACK:
                this.deviceSetNetSettingsAck(data)
                break
            case OperatorType.GET_NET_SETTINGS_ACK:
                this.deviceGetNetSettingsAck(data)
                break
            case OperatorType.SET_DATE_TIME_ACK:
                this.deviceSetDateTimeAck(data)
                break
            case OperatorType.SET_MQTT_SETTINGS_ACK:
                this.deviceSetMqttSettingsAck(data)
                break
            case OperatorType.GET_MQTT_SETTINGS_ACK:
                this.deviceGetMqttSettingsAck(data)
                break
            case OperatorType.GET_STATUS_ACU_ACK:
                this.deviceGetStatusAcuAck(data)
                break
            case OperatorType.SET_EXT_BRD_ACK:
                this.deviceSetExtBrdAck(data)
                break
            case OperatorType.GET_EXT_BRD_ACK:
                this.deviceGetExtBrdAck(data)
                break
            case OperatorType.SET_RD_ACK:
                this.deviceSetRdAck(data)
                break
            case OperatorType.GET_RD_ACK:
                this.deviceGetRdAck(data)
                break
            case OperatorType.SET_OUTPUT_ACK:
                this.deviceSetOutputAck(data)
                break
            case OperatorType.GET_OUTPUT_ACK:
                this.deviceGetOutputAck(data)
                break
            case OperatorType.GET_INPUT_ACK:
                this.deviceGetInputAck(data)
                break
            case OperatorType.SET_CTP_DOOR_ACK:
                this.deviceSetCtpDoorAck(data)
                break
            case OperatorType.EVENT:
                this.deviceEvent(data)
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
                this.setCardKeysAck(data)
                break
            case OperatorType.ADD_CARD_KEY_ACK:
                this.addCardKeyAck(data)
                break
            case OperatorType.EDIT_KEY_ACK:
                this.editKeyAck(data)
                break
            case OperatorType.DELL_KEYS_ACK:
                this.dellKeysAck(data)
                break
            case OperatorType.DELL_ALL_KEYS_ACK:
                this.dellAllKeysAck(data)
                break
            case OperatorType.SET_SDL_DAILY_ACK:
                this.setSdlDailyAck(data)
                break
            case OperatorType.SET_SDL_WEEKLY_ACK:
                this.setSdlWeeklyAck(data)
                break
            case OperatorType.SET_SDL_FLEXI_TIME_ACK:
                this.setSdlFlexiTimeAck(data)
                break
            case OperatorType.ADD_DAY_FLEXI_TIME_ACK:
                this.addDayFlexiTimeAck(data)
                break
            case OperatorType.END_SDL_FLEXI_TIME_ACK:
                this.endSdlFlexiTimeAck(data)
                break
            case OperatorType.DEL_DAY_FLEXI_TIME_ACK:
                this.delDayFlexiTimeAck(data)
                break
            case OperatorType.SET_SDL_SPECIFIED_ACK:
                this.setSdlSpecifiedAck(data)
                break
            case OperatorType.ADD_DAY_SPECIFIED_ACK:
                this.addDaySpecifiedAck(data)
                break
            case OperatorType.END_SDL_SPECIFIED_ACK:
                this.endSdlSpecifiedAck(data)
                break
            case OperatorType.DELL_DAY_SPECIFIED_ACK:
                this.dellDaySpecifiedAck(data)
                break
            case OperatorType.DELL_SHEDULE_ACK:
                this.dellSheduleAck(data)
                break
            case OperatorType.DEV_TEST_ACK:
                this.deviceDevTestAck(topic)
                break

            default:
                break
        }
    }

    public static async deviceRegistration (topic: string, data: any) {
        try {
            const acu_data: any = {}
            const company = Number(data.topic.split('/')[1])
            acu_data.name = data.name
            acu_data.description = data.note
            acu_data.serial_number = acu_data.device_id
            acu_data.fw_version = data.firmware_ver
            acu_data.time = JSON.stringify({
                time_zone: acu_data.gmt,
                timezone_from_facility: false,
                enable_daylight_saving_time: false,
                daylight_saving_time_from_user_account: false
            })
            acu_data.company = company

            await Acu.addItem(acu_data)
            SendDevice.accept(data.topic)
            console.log('success:true')
        } catch (error) {
            console.log('error deviceRegistrion ', error)
        }
    }

    public static deviceAcceptAck (data: any) {
        console.log('deviceAcceptAck', data)
        if (data.result.errorNo === 0) {
            SendDevice.login(data.topic)
        }
    }

    public static async deviceLoginAck (data: any) {
        console.log('deviceLoginAck', data)
        if (data.result.errorNo === 0) {
            const location = data.topic.split('/').slice(0, 2).join('/')
            const company = Number(data.topic.split('/')[1])
            const device_id = data.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                if (acu.session_id == null) {
                    SendDevice.setPass(location, device_id, data.session_id)
                }
                acu.session_id = data.session_id
                await acu.save()
                console.log('login complete')
            } else {
                console.log('error deviceLoginAck', data)
            }
        }
    }

    public static async deviceLogOutAck (data: any) {
        console.log('deviceLogOutAck', data)
        if (data.result.errorNo === 0) {
            console.log('logout complete')
            const company = Number(data.topic.split('/')[1])
            const device_id = data.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            acu.session_id = '0'
            await acu.save()
            // this.login(data.topic)
        }
    }

    public static async deviceSetPassAck (data: any) {
        console.log('deviceSetPassAck', data)
        if (data.result.errorNo === 0) {
            const company = Number(data.topic.split('/')[1])
            const device_id = Number(data.topic.split('/')[3])
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                acu.password = data.send_data.info.password
                await acu.save()
                console.log('deviceSetPass complete')
            } else {
                console.log('error deviceSetPass', data)
            }
        }
    }

    public static async deviceLogOutEvent (data: any) {
        console.log('deviceLogOutEvent', data)
        if (data.result.errorNo === 0) {
            const company = Number(data.topic.split('/')[1])
            const device_id = data.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                acu.session_id = '0'
                await acu.save()
                SendDevice.login(data.topic)
                console.log('deviceLogOutEvent complete')
            } else {
                console.log('error deviceLogOutEvent', data)
            }
        }
    }

    public static async deviceSetNetSettingsAck (data: any) {
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

        console.log('deviceSetNetSettingsAck', data)
        try {
            if (data.result.errorNo === 0) {
                const company = Number(data.topic.split('/')[1])
                const device_id = data.topic.split('/')[3]
                const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
                if (acu) {
                    const info = data.send_data.info
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
                    console.log('error deviceSetNetSettingsAck', data)
                }
            }
        } catch (error) {
            console.log('error deviceSetNetSettingsAck', error)
        }
    }

    public static deviceGetNetSettingsAck (data: any): void {
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

    public static async deviceSetDateTimeAck (data: any) {
        // receive data from mqtt
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

        if (data.result.errorNo === 0) {
            const company = Number(data.topic.split('/')[1])
            const device_id = data.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                const info = data.send_data.info
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
                console.log('error deviceSetDateTimeAck', data)
            }
        }
    }

    public static deviceSetMqttSettingsAck (data: any): void {
        console.log('deviceSetMqttSettingsAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetMqttSettingsAck complete')
        }
    }

    public static deviceGetMqttSettingsAck (data: any): void {
        console.log('deviceGetMqttSettingsAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetMqttSettingsAck complete')
        }
    }

    public static deviceGetStatusAcuAck (data: any): void {
        console.log('deviceGetStatusAcuAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetStatusAcuAck complete')
        }
    }

    public static deviceSetExtBrdAck (data: any): void {
        console.log('deviceSetExtBrdAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetExtBrdAck complete')
        }
    }

    public static deviceGetExtBrdAck (data: any): void {
        console.log('deviceGetExtBrdAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetExtBrdAck complete')
        }
    }

    public static deviceSetRdAck (data: any): void {
        console.log('deviceSetRd', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetRd complete')
        }
    }

    public static deviceGetRdAck (data: any): void {
        console.log('deviceGetRdAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetRdAck complete')
        }
    }

    public static deviceSetOutputAck (data: any): void {
        console.log('deviceGetRdAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetRdAck complete')
        }
    }

    public static deviceGetOutputAck (data: any): void {
        console.log('deviceGetOutputAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetOutputAck complete')
        }
    }

    public static deviceGetInputAck (data: any): void {
        console.log('deviceGetInputAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetInputAck complete')
        }
    }

    public static deviceSetCtpDoorAck (data: any): void {
        console.log('deviceSetCtpDoorAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetCtpDoorAck complete')
        }
    }

    public static deviceEvent (data: any): void {
        console.log('deviceEvent', data)
        if (data.result.errorNo === 0) {
            console.log('deviceEvent complete')
        }
    }

    public static deviceSetEventsModAck (data: any): void {
        console.log('deviceSetEventsModAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetEventsModAck complete')
        }
    }

    public static deviceGetEventsModAck (data: any): void {
        console.log('deviceGetEventsModAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetEventsModAck complete')
        }
    }

    public static deviceGetEventsAck (data: any): void {
        console.log('deviceGetEventsAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetEventsAck complete')
        }
    }

    public static deviceSetAccessModeAck (data: any): void {
        console.log('deviceSetAccessModeAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetAccessModeAck complete')
        }
    }

    public static deviceGetAccessModeAck (data: any): void {
        console.log('deviceGetAccessModeAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceGetAccessModeAck complete')
        }
    }

    public static deviceSinglePassAck (data: any): void {
        console.log('deviceSinglePassAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSinglePassAck complete')
        }
    }

    public static setCardKeysAck (data: any): void {
        console.log('setCardKeysAck', data)
        if (data.result.errorNo === 0) {
            console.log('setCardKeysAck complete')
        }
    }

    public static addCardKeyAck (data: any): void {
        console.log('addCardKeyAck', data)
        if (data.result.errorNo === 0) {
            console.log('addCardKeyAck complete')
        }
    }

    public static editKeyAck (data: any): void {
        console.log('editKeyAck', data)
        if (data.result.errorNo === 0) {
            console.log('editKeyAck complete')
        }
    }

    public static dellKeysAck (data: any): void {
        console.log('dellKeysAck', data)
        if (data.result.errorNo === 0) {
            console.log('dellKeysAck complete')
        }
    }

    public static dellAllKeysAck (data: any): void {
        console.log('dellAllKeysAck', data)
        if (data.result.errorNo === 0) {
            console.log('dellAllKeysAck complete')
        }
    }

    public static setSdlDailyAck (data: any): void {
        console.log('setSdlDailyAck', data)
        if (data.result.errorNo === 0) {
            console.log('setSdlDailyAck complete')
        }
    }

    public static setSdlWeeklyAck (data: any): void {
        console.log('setSdlWeeklyAck', data)
        if (data.result.errorNo === 0) {
            console.log('setSdlWeeklyAck complete')
        }
    }

    public static async setSdlFlexiTimeAck (data: any) {
        console.log('setSdlFlexiTimeAck', data)
        if (data.result.errorNo === 0) {
            console.log('setSdlFlexiTimeAck complete')
            const location = data.topic.split('/').slice(0, 2).join('/')
            const device_id = data.topic.split('/')[3]
            const company = data.topic.split('/')[1]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            if (acu) {
                data.send_data.adds_count = 0
                SendDevice.addDayFlexiTime(location, device_id, acu.session_id, data.send_data)
            } else {
                console.log('error setSdlFlexiTimeAck', data)
            }
        }
    }

    public static async addDayFlexiTimeAck (data: any) {
        console.log('addDayFlexiTimeAck', data)
        if (data.result.errorNo === 0) {
            console.log('addDayFlexiTimeAck complete')
            const location = data.topic.split('/').slice(0, 2).join('/')
            const device_id = data.topic.split('/')[3]
            const company = data.topic.split('/')[1]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })

            if (acu) {
                const set_params = data.send_data.set_params
                set_params.adds_count++
                if (set_params.adds_count === set_params.info.DaysCount) {
                    SendDevice.endSdlFlexiTime(location, device_id, acu.session_id, set_params)
                } else {
                    SendDevice.addDayFlexiTime(location, device_id, acu.session_id, set_params)
                }
            } else {
                console.log('error setSdlFlexiTimeAck', data)
            }
        }
    }

    public static endSdlFlexiTimeAck (data: any): void {
        console.log('endSdlFlexiTimeAck', data)
        if (data.result.errorNo === 0) {
            console.log('endSdlFlexiTimeAck complete')
        }
    }

    public static delDayFlexiTimeAck (data: any): void {
        console.log('delDayFlexiTimeAck', data)
        if (data.result.errorNo === 0) {
            console.log('delDayFlexiTimeAck complete')
        }
    }

    public static setSdlSpecifiedAck (data: any): void {
        console.log('setSdlSpecifiedAck', data)
        if (data.result.errorNo === 0) {
            console.log('setSdlSpecifiedAck complete')
        }
    }

    public static addDaySpecifiedAck (data: any): void {
        console.log('addDaySpecifiedAck', data)
        if (data.result.errorNo === 0) {
            console.log('addDaySpecifiedAck complete')
        }
    }

    public static endSdlSpecifiedAck (data: any): void {
        console.log('endSdlSpecifiedAck', data)
        if (data.result.errorNo === 0) {
            console.log('endSdlSpecifiedAck complete')
        }
    }

    public static dellDaySpecifiedAck (data: any): void {
        console.log('dellDaySpecifiedAck', data)
        if (data.result.errorNo === 0) {
            console.log('dellDaySpecifiedAck complete')
        }
    }

    public static dellSheduleAck (data: any): void {
        console.log('dellSheduleAck', data)
        if (data.result.errorNo === 0) {
            console.log('dellSheduleAck complete')
        }
    }

    public static deviceDevTestAck (data: any): void {
        console.log('deviceDevTestAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceDevTestAck complete')
        }
    }
}
