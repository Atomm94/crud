import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'
import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'
import SendDevice from './SendDevice'

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
            case OperatorType.GET_EVENTS_MOD_ACK:
                this.deviceGetEventsModAck(topic)
                break
            case OperatorType.GET_EVENTS_ACK:
                this.deviceGetEventsAck(topic)
                break
            case OperatorType.GET_ACCESS_MODE_ACK:
                this.deviceGetAccessModeAck(topic)
                break
            case OperatorType.SINGLE_PASS_ACK:
                this.deviceSinglePassAck(topic)
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
            const acu_data = data.info
            const company = Number(data.topic.split('/')[1])
            acu_data.company = company
            acu_data.serial_number = acu_data.device_id
            acu_data.time = JSON.stringify({
                time_zone: acu_data.gmt,
                timezone_from_facility: false,
                enable_daylight_saving_time: false,
                daylight_saving_time_from_user_account: false
            })

            const add: any = await Acu.addItem(acu_data)
            console.log('success:true', add)
            const send_data = {
                operator: OperatorType.ACCEPT,
                location: data.topic.split('/').slice(0, 2).join('/'),
                device_id: acu_data.serial_number
            }

            MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
        } catch (error) {
            console.log('error deviceRegistrion ', error)
        }
    }

    public static async deviceAcceptAck (data: any) {
        console.log('deviceAcceptAck', data)
        if (data.result.errorNo === 0) {
            SendDevice.login(data.topic)
        }
    }

    public static async deviceLoginAck (data: any) {
        console.log('deviceLoginAck', data)
        if (data.result.errorNo === 0) {
            const company = Number(data.topic.split('/')[1])
            const device_id = data.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            acu.session_id = data.session_id
            acu.save()
            console.log('login complete')
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

    public static deviceSetPassAck (data: any): void {
        console.log('deviceSetPassAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceSetPass complete')
        }
    }

    public static async deviceLogOutEvent (data: any) {
        console.log('deviceLogOutEvent', data)
        if (data.result.errorNo === 0) {
            const company = Number(data.topic.split('/')[1])
            const device_id = data.topic.split('/')[3]
            const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
            acu.session_id = '0'
            await acu.save()
            SendDevice.login(data.topic)
            console.log('deviceLogOutEvent complete')
        }
    }

    public static deviceSetNetSettingsAck (data: any): void {
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

    public static deviceSetDateTimeAck (data: any): void {
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
            // prcanq aperik
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

    public static deviceDevTestAck (data: any): void {
        console.log('deviceDevTestAck', data)
        if (data.result.errorNo === 0) {
            console.log('deviceDevTestAck complete')
        }
    }
}
