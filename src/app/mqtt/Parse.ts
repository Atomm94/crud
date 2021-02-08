import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'
import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'
import { uid } from 'uid'

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
            this.login(data.topic)
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
            this.login(data.topic)
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

    public static async login (topic: any) {
        const location = topic.split('/').slice(0, 2).join('/')
        const company = Number(topic.split('/')[1])
        const device_id = topic.split('/')[3]
        const acu: any = await Acu.findOne({ serial_number: device_id, company: company })

        // when admin deleted this acu what we do ???
        const send_data: any = {
            operator: OperatorType.LOGIN,
            location: location,
            device_id: device_id,
            username: acu.username ? acu.username : 'admin',
            password: acu.password ? acu.password : ''
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static logOut (topic: any): void {
        const send_data: any = {
            operator: OperatorType.LOGOUT,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3]
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static async setPass (location: string, device_id: any, session_id: string) {
        // const location = topic.split('/').slice(0, 2).join('/')
        // const device_id = topic.split('/')[3]

        const generate_pass = uid(32)
        const send_data = {
            operator: OperatorType.SET_PASS,
            session_id: session_id,
            location: location,
            device_id: device_id,
            username: 'admin',
            password: generate_pass
        }
        const company = Number(location.split('/')[1])
        const acu: any = await Acu.findOne({ serial_number: device_id, company: company })
        acu.password = generate_pass
        await acu.save()
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setNetSettings (location: string, device_id: string, session_id: string, net_data: any): void {
        // {
        //     "operator": "SetNetSettings",
        //     "session_Id": "1111111111",
        //     "message_Id": "3333333333",
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
        //         }
        // }
        const send_data = {
            operator: OperatorType.SET_NET_SETTINGS,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: '11111111',
            info: net_data

        }

        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getNetSettings (location: string, device_id: string, session_id: string): void {
        // send to device
        // {
        //     operator: 'GetNetSettings',
        //     location: '1215/151',
        //     device_id: '123456',
        //     session_id: '11111111',
        //     message_id: '11111111'
        // }

        const send_data = {
            operator: OperatorType.GET_NET_SETTINGS,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: '11111111'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setDateTime (location: string, device_id: string, session_id: string, gmt: number): void {
        const send_data = {
            operator: OperatorType.SET_DATE_TIME,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: '11111111',
            gmt: gmt
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static deviceSetMqttSettings (topic: any): void {
        const send_data: any = {
            operator: OperatorType.SET_MQTT_SETTINGS,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3]
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }
}
