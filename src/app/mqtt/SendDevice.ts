import MQTTBroker from './mqtt'
import { SendTopics } from './Topics'
import { OperatorType } from './Operators'
import { Acu } from '../model/entity/Acu'
// import { uid } from 'uid'
import { acuConnectionType } from '../enums/acuConnectionType.enum'

export default class SendDevice {
    public static async accept (topic: any) {
        const location = topic.split('/').slice(0, 2).join('/')
        const device_id = topic.split('/')[3]

        const send_data: any = {
            operator: OperatorType.ACCEPT,
            location: location,
            device_id: device_id,
            session_id: '0',
            message_id: '0',
            info: 'none'

        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static async login (topic: any) {
        console.log(99999999999)

        const location = topic.split('/').slice(0, 2).join('/')
        const company = Number(topic.split('/')[1])
        const device_id = topic.split('/')[3]
        const acu: any = await Acu.findOne({ serial_number: device_id, company: company })

        // when admin deleted this acu what we do ???
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.LOGIN,
            session_id: '0',
            message_id: message_id.toString(),
            location: location,
            device_id: device_id,
            info: {
                username: acu.username ? acu.username : 'admin',
                password: acu.password ? acu.password : ''
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static logOut (location: string, device_id: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.LOGOUT,
            session_id: session_id,
            message_id: message_id.toString(),
            location: location,
            device_id: device_id,
            info: 'none'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static async setPass (location: string, device_id: any, session_id: string) {
        // const location = topic.split('/').slice(0, 2).join('/')
        // const device_id = topic.split('/')[3]
        const message_id = new Date().getTime()

        // const generate_pass = uid(32)
        const send_data = {
            operator: OperatorType.SET_PASS,
            session_id: session_id,
            message_id: message_id.toString(),
            location: location,
            device_id: device_id,
            info: {
                username: 'admin',
                password: 'admin',
                use_sha: 0
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setNetSettings (location: string, device_id: number, session_id: string, net_data: any): void {
        if (typeof net_data === 'string') net_data = JSON.parse(net_data)
        const message_id = new Date().getTime()
        const send_data = {
            operator: OperatorType.SET_NET_SETTINGS,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                connection_type: (net_data.connection_type === acuConnectionType.WI_FI) ? 0 : 1,
                connection_mod: (net_data.dhcp) ? 0 : 1,
                // SSID: 'Office242',
                // Pass: '12346789',
                ip_address: net_data.ip_address,
                mask: net_data.subnet_mask,
                Gate: net_data.gateway,
                DNS1: net_data.dns_server
                // DNS2: '8.8.8.8',
                // AP_SSID: 'LmWf123456789',
                // AP_PASS: '123456',
                // HideSSID: false,
                // time_ap_on: 80,
                // MAC_Wr: 'none',
                // MAC_Eth: 'none'
            }

        }

        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getNetSettings (location: string, device_id: string, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data = {
            operator: OperatorType.GET_NET_SETTINGS,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info: 'none'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setDateTime (location: string, device_id: number, session_id: string, date_data: any): void {
        if (typeof date_data === 'string') date_data = JSON.parse(date_data)
        const message_id = new Date().getTime()
        const send_data = {
            operator: OperatorType.SET_DATE_TIME,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                DateTime: 1583636400,
                GMT: date_data.time_zone,
                NTP1: 'pool.ntp.org',
                NTP2: 'pool2.ntp.org:123',
                DST_GMT: false,
                DST_Start: 1583636400,
                DST_End: 1604196000,
                DST_Shift: 3600
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setMqttSettings (location: string, device_id: number, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_MQTT_SETTINGS,
            // location: topic.split('/').slice(0, 2).join('/'),
            // device_id: topic.split('/')[3],
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                BrokerAdr: 'lumiring.msg.th',
                BrokerPort: 3285,
                ClientID: '101FRE1111325665454RETV123355',
                Use_SSL: false,
                User_Name: 'TR2584567452121TFD',
                User_Pass: 'ASTR565VFDF8787fdtrtJ76p',
                Location: '55884455/main_perimeter_group',
                DeviceID: '123456789',
                use_enryption: false
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getMqttSettings (location: string, device_id: number, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_MQTT_SETTINGS,
            // location: topic.split('/').slice(0, 2).join('/'),
            // device_id: topic.split('/')[3],
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info: 'none'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getStatusAcu (location: string, device_id: number, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_STATUS_ACU,
            // location: topic.split('/').slice(0, 2).join('/'),
            // device_id: topic.split('/')[3],
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info: 'none'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setExtBrd (location: string, device_id: number, session_id: string, ext_device_data: any): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_EXT_BRD,
            // location: topic.split('/').slice(0, 2).join('/'),
            // device_id: topic.split('/')[3],
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                // Brd_inteface_type: 0,
                Brd_idx: ext_device_data.ext_board,
                Brd_inputs: ext_device_data.ext_boards.input,
                Brd_outputs: ext_device_data.ext_boards.output,
                // RS485_Idx: 0,
                // Brd_RS45_adr: 0,
                // RS485_Uart_Mode: 'none',
                RS485_Baud_Rate: ext_device_data.baud_rate,
                // Brd_prot: 0,
                Brd_Eth_adr: ext_device_data.address ? ext_device_data.address : 'none',
                Brd_Eth_port: ext_device_data.port
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getExtBrd (location: string, device_id: number, session_id: string, id: number): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_EXT_BRD,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Brd_idx: id
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setRd (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_RD,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Rd_idx: 0,
                Rd_opt: 0,
                Rd_type: 0,
                Rd_Wg_idx: -1,
                Rd_Wg_type: 2,
                Rd_Key_endian: 0,
                Rd_WG_RG: -1,
                Rd_WG_Red: -1,
                Rd_WG_Green: -1,
                Rd_RS485_idx: -1,
                Rd_OSDP_adr: 0,
                Rd_OSDP_bd: 9600,
                Rd_OSDP_WgPuls: 0,
                Rd_OSDP_KeyPad: 0,
                Rd_OSDP_singl: 0,
                Rd_OSDP_tracing: 0,
                Rd_MQTT: 'none',
                Rd_ind_var: 0,
                Rd_beep: 0,
                Rd_bt_prox: 10,
                Rd_sens_act: 50,
                Rd_mode: 0,
                Rd_Eth: 'none',
                Rd_Eth_port: 0
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getRd (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_RD,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Rd_idx: 0
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setOutput (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_OUTPUT,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Gpio_opt: 0,
                Output_idx: 3,
                Output_mod: 1,
                Output_type: -1,
                Output_tm: -1,
                Gpio_value: 1
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getOutput (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_OUTPUT,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Gpio_opt: 0,
                Output_idx: 3
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getIntput (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_INPUT,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Gpio_opt: 0,
                Input_idx: 5
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static cardProtection (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.CARD_PROTECTION,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Card_Protection: true,
                Protection_Key: 325689742,
                Protection_Sec: 8,
                Lock_All: true,
                Pass_A: 'F1F2F3F4F5F6',
                Pass_B: 'A1A2A3A4A5A6',
                BitMask: 64
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setCtpDoor (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_CTP_DOOR,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info:
            {
                Control_point_idx: 1,
                Control_point_gId: '12548789522',
                Leaving_Zone: 'Hall',
                Came_To_Zone: 'Meeting room',
                Ctp_Apb_Group: 'Meeting room/ABP',
                Control_type: 1,
                APB_Wrk_type: 0,
                APB_Mode: -1,
                APB_Time: 0,
                Work_Mode: 0,
                Door_Allarm: 1,
                Door_Allarm_Tm: 1500,
                Door_Delay: 6,
                Door_Lock_mode: 0,
                Door_Lock_type: 1,
                Door_Lock_pulse: 500,
                Lock_Relay_opt: 0,
                Lock_Relay_idx: 0,
                Alarm_out_opt: 0,
                Alarm_out_idx: 2,
                Button_rex_opt: 0,
                Button_rex_idx: 0,
                Button_rex_sens: 20,
                Door_sens_opt: 0,
                Door_sens_idx: 1,
                Rex_release_tm: 255,
                Alarm_In_opt: 0,
                Alarm_In_idx: 1,
                Acc_mod: 0,
                Ctp_auto_mod: -1,
                Shedul_auto_mod: 'none',
                Owner_mod: -1,
                Owner_keys: 'none',
                Rd0_idx: 0,
                Rd0_dir: 1,
                Rd1_idx: 1,
                Rd1_dir: 0,
                Rd2_idx: -1,
                Rd2_dir: -1,
                Rd3_idx: -1,
                Rd3_dir: -1
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setEventsMod (location: string, device_id: number, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_EVENTS_MOD,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                User_Event: true,
                User_Event_Save: true,
                System_Event: true,
                System_Event_Save: true,
                Allarm_Event: true,
                Allarm_Event_Save: true
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getEventsMod (location: string, device_id: number, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_EVENTS_MOD,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info: 'none'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getEvents (location: string, device_id: number, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_EVENTS,
            location: location,
            device_id: device_id,
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                StartDate: 1599904641,
                EndDate: 0
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setAccessMode (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_ACCESS_MODE,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Control_point_idx: 1,
                Control_point_gId: 'none',
                Access_mode: 1
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static getAccessMode (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.GET_ACCESS_MODE,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Control_point_idx: 1,
                Control_point_gId: 'none'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static single_pass (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SINGLE_PASS,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Control_Point_GId: 'none',
                Control_point_idx: 12,
                Direction: -1
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setCardKeys (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_CARD_KEYS,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                KeysDataLength: 49,
                KeysCount: 1,
                Keys: '/111112;4,0012DE62;1;2222223;3333334;1;0;0;0;1;0/'
            }

            // Пример команды на запись ключа двух  ключей:
            // {
            // "KeysDataLength":97,
            // "KeysCount":2,
            // "Keys":"/111112;4,0012DE62;1;2222223;3333334;1;0;0;0;1;0/111112;4,001AE1C1;1;2222223;3333334;1;0;0;0;1;0/"
            // }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static addCardKey (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.ADD_CARD_KEY,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                KeysDataLength: 49,
                KeysCount: 1,
                Keys: '/111112;4,0012DE62;1;2222223;3333334;1;0;0;0;1;0/'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static editKey (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.EDIT_KEY,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Key_id: 111113,
                Key_len: 4,
                Key: 'none',
                Schedule_id: -1,
                Key_status: 0,
                Kind_key: -1,
                Key_type: -1,
                Passes: -1,
                ABP: -1,
                Start_date: -1,
                Expiration_date: -1
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static dellKeys (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.DELL_KEYS,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                KeysDataLength: 15,
                Keys_count: 2,
                Keys_id: '/111112/111113/'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static dellAllKeys (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.DELL_ALL_KEYS,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: 'none'
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setSdlDaily (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_SDL_DAILY,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254889,
                Ctp_idx: 0,
                TmStart: '32400;50400',
                TmEnd: '46800;64800'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setSdlWeekly (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_SDL_WEEKLY,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254890,
                Ctp_idx: 0,
                Tm0_Start: '32400;50400',
                Tm0_End: '46800;64800',
                Tm1_Start: '32400;50400',
                Tm1_End: '46800;64800',
                Tm2_Start: '32400;50400',
                Tm2_End: '46800;64800',
                Tm3_Start: '32400;50400',
                Tm3_End: '46800;64800',
                Tm4_Start: '32400;50400',
                Tm4_End: '46800;64800',
                Tm5_Start: 'none',
                Tm5_End: 'none',
                Tm6_Start: 'none',
                Tm6_End: 'none'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setSdlFlexiTime (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_SDL_FLEXI_TIME,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254899,
                Ctp_idx: 0,
                DayStart: 1611598042,
                DaysCount: 4
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static addDayFlexiTime (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.ADD_DAY_FLEXI_TIME,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254899,
                Ctp_idx: 0,
                Day_idx: 0,
                TmStart: '32400;50400',
                TmEnd: '46800;64800'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static endSdlFlexiTime (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.END_SDL_FLEXI_TIME,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254899,
                Ctp_idx: 0,
                DaysCount: 4
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static delDayFlexiTime (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.DEL_DAY_FLEXI_TIME,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254899,
                Ctp_idx: 0,
                Day_idx: 2
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static setSdlSpecified (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.SET_SDL_SPECIFIED,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254844,
                Ctp_idx: 0,
                DaysCount: 3
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static addDaySpecified (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.ADD_DAY_SPECIFIED,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254844,
                Ctp_idx: 0,
                Day: 1611598042,
                TmStart: '32400;50400',
                TmEnd: '46800;64800'
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static endSdlSpecified (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.END_SDL_SPECIFIED,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254844,
                Ctp_idx: 0,
                DaysCount: 3
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static dellDaySpecified (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.DELL_DAY_SPECIFIED,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254844,
                Ctp_idx: 0,
                Day_idx: 3
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static dellShedule (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.DELL_SHEDULE,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                Shedule_id: 1254844,
                Ctp_idx: 0
            }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }

    public static devTest (topic: any, session_id: string): void {
        const message_id = new Date().getTime()
        const send_data: any = {
            operator: OperatorType.DEV_TEST,
            location: topic.split('/').slice(0, 2).join('/'),
            device_id: topic.split('/')[3],
            session_id: session_id,
            message_id: message_id.toString(),
            info: {
                inteface_type: 0,
                RS485_Idx: 0,
                Dev_RS45_adr: 1,
                RS485_Uart_Mode: 'none',
                RS485_Baud_Rate: 9600,
                Dev_prot: 1,
                Test_type: 0,
                Dev_Eth_adr: 'none',
                Dev_Eth_port: 3775,
                Dev_type: 1,
                gpio_idx_set: -1,
                gpio_set: -1,
                gpio_idx_get: -1
            }
            // info: {
            //     inteface_type: 0,
            //     RS485_Idx: 0,
            //     Dev_RS45_adr: 2,
            //     RS485_Uart_Mode: 'none',
            //     RS485_Baud_Rate: 9600,
            //     Dev_prot: 0,
            //     Test_type: 1,
            //     Dev_Eth_adr: 'none',
            //     Dev_Eth_port: 3775,
            //     Dev_type: 0,
            //     gpio_idx_set: 4,
            //     gpio_set: 1,
            //     gpio_idx_get: 7
            // }
        }
        MQTTBroker.publishMessage(SendTopics.CRUD_MQTT, JSON.stringify(send_data))
    }
}
