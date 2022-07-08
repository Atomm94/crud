import { OperatorType } from '../mqtt/Operators'
export function generateMessageForOperator (operator: OperatorType) {
    switch (operator) {
        case OperatorType.PING_ACK:
            return 'Failed to set ping parameters'
        case OperatorType.ACCEPT_ACK:
            return 'Failed to set accept parameters'
        case OperatorType.LOGIN_ACK:
            return 'Failed to set login parameters'
        case OperatorType.LOGOUT_ACK:
            return 'Failed to set logout parameters'
        case OperatorType.SET_PASS_ACK:
            return 'Failed to set pass parameters'
        case OperatorType.SET_NET_SETTINGS_ACK:
            return 'Failed to set net settings parameters'
        case OperatorType.GET_NET_SETTINGS_ACK:
            return 'Failed to get net settings parameters'
        case OperatorType.SET_DATE_TIME_ACK:
            return 'Failed to set date time parameters'
        case OperatorType.SET_MQTT_SETTINGS_ACK:
            return 'Failed to set mqtt settings parameters'
        case OperatorType.GET_MQTT_SETTINGS_ACK:
            return 'Failed to get mqtt settings parameters'
        case OperatorType.GET_STATUS_ACU_ACK:
            return 'Failed to get status of acu parameters'
        case OperatorType.SET_EXT_BRD_ACK:
            return 'Failed to set extension device parameters'
        case OperatorType.GET_EXT_BRD_ACK:
            return 'Failed to get extension device parameters'
        case OperatorType.DEL_EXT_BRD_ACK:
            return 'Failed to del extension device parameters'
        case OperatorType.SET_RD_ACK:
            return 'Failed to set reader parameters'
        case OperatorType.GET_RD_ACK:
            return 'Failed to get reader parameters'
        case OperatorType.DEL_RD_ACK:
            return 'Failed to del reader parameters'
        case OperatorType.SET_OUTPUT_ACK:
            return 'Failed to set output parameters'
        case OperatorType.GET_OUTPUT_ACK:
            return 'Failed to get output parameters'
        case OperatorType.GET_INPUT_ACK:
            return 'Failed to get input parameters'
        case OperatorType.SET_CTP_DOOR_ACK:
            return 'Failed to set access point door parameters'
        case OperatorType.GET_CTP_DOOR_ACK:
            return 'Failed to get access point door parameters'
        case OperatorType.DEL_CTP_DOOR_ACK:
            return 'Failed to del access point door parameters'
        case OperatorType.SET_CTP_TURNSTILE_ACK:
            return 'Failed to set access point turnstile parameters'
        case OperatorType.GET_CTP_TURNSTILE_ACK:
            return 'Failed to get access point turnstile parameters'
        case OperatorType.DEL_CTP_TURNSTILE_ACK:
            return 'Failed to del access point turnstile parameters'
        case OperatorType.SET_CTP_GATE_ACK:
            return 'Failed to set access point gate parameters'
        case OperatorType.GET_CTP_GATE_ACK:
            return 'Failed to get access point gate parameters'
        case OperatorType.DEL_CTP_GATE_ACK:
            return 'Failed to del access point gate parameters'
        case OperatorType.SET_CTP_GATEWAY_ACK:
            return 'Failed to set access point gateway parameters'
        case OperatorType.GET_CTP_GATEWAY_ACK:
            return 'Failed to get access point gateway parameters'
        case OperatorType.DEL_CTP_GATEWAY_ACK:
            return 'Failed to del access point gateway parameters'
        case OperatorType.SET_CTP_FLOOR_ACK:
            return 'Failed to set access point floor parameters'
        case OperatorType.GET_CTP_FLOOR_ACK:
            return 'Failed to get access point floor parameters'
        case OperatorType.DEL_CTP_FLOOR_ACK:
            return 'Failed to del access point floor parameters'
        case OperatorType.SET_EVENTS_MOD_ACK:
            return 'Failed to set events mode parameters'
        case OperatorType.GET_EVENTS_MOD_ACK:
            return 'Failed to get events mode parameters'
        case OperatorType.GET_EVENTS_ACK:
            return 'Failed to get events parameters'
        case OperatorType.SET_ACCESS_MODE_ACK:
            return 'Failed to set access mode parameters'
        case OperatorType.GET_ACCESS_MODE_ACK:
            return 'Failed to get access mode parameters'
        case OperatorType.SINGLE_PASS_ACK:
            return 'Failed to set single pass parameters'
        case OperatorType.SET_CARD_KEYS_ACK:
            return 'Failed to set credential parameters'
        case OperatorType.ADD_CARD_KEY_ACK:
            return 'Failed to add credential parameters'
        case OperatorType.END_CARD_KEY_ACK:
            return 'Failed to set end of credential parameters'
        case OperatorType.EDIT_KEY_ACK:
            return 'Failed to edit credential parameters'
        case OperatorType.DELL_KEYS_ACK:
            return 'Failed to del credentials parameters'
        case OperatorType.DELL_ALL_KEYS_ACK:
            return 'Failed to del all credentials parameters'
        case OperatorType.SET_SDL_DAILY_ACK:
            return 'Failed to set schedule daily parameters'
        case OperatorType.DEL_SDL_DAILY_ACK:
            return 'Failed to del schedule daily parameters'
        case OperatorType.SET_SDL_WEEKLY_ACK:
            return 'Failed to set schedule weekly parameters'
        case OperatorType.DEL_SDL_WEEKLY_ACK:
            return 'Failed to del schedule weekly parameters'
        case OperatorType.SET_SDL_FLEXI_TIME_ACK:
            return 'Failed to set schedule flexi time parameters'
        case OperatorType.ADD_DAY_FLEXI_TIME_ACK:
            return 'Failed to add day of schedule flexi time parameters'
        case OperatorType.END_SDL_FLEXI_TIME_ACK:
            return 'Failed to set end of schedule flexi time parameters'
        case OperatorType.DEL_SDL_FLEXI_TIME_ACK:
            return 'Failed to del schedule flexi time parameters'
        case OperatorType.DEL_DAY_FLEXI_TIME_ACK:
            return 'Failed to del day of schedule flexi time parameters'
        case OperatorType.SET_SDL_SPECIFIED_ACK:
            return 'Failed to set schedule specified parameters'
        case OperatorType.ADD_DAY_SPECIFIED_ACK:
            return 'Failed to add day of schedule specified parameters'
        case OperatorType.END_SDL_SPECIFIED_ACK:
            return 'Failed to set end of schedule specified parameters'
        case OperatorType.DEL_SDL_SPECIFIED_ACK:
            return 'Failed to del schedule specified parameters'
        case OperatorType.DELL_DAY_SPECIFIED_ACK:
            return 'Failed to del day of schedule specified parameters'
        case OperatorType.SET_SDL_ORDINAL_ACK:
            return 'Failed to set schedule ordinal parameters'
        case OperatorType.DEL_SDL_ORDINAL_ACK:
            return 'Failed to del schedule ordinal parameters'
        case OperatorType.SET_DAY_ORDINAL_ACK:
            return 'Failed to set day of schedule ordinal parameters'
        case OperatorType.DEL_DAY_ORDINAL_ACK:
            return 'Failed to del day of schedule ordinal parameters'
        case OperatorType.DELL_SHEDULE_ACK:
            return 'Failed to del shedule parameters'
        case OperatorType.DEV_TEST_ACK:
            return 'Failed to set dev test parameters'
        case OperatorType.SET_HEART_BIT_ACK:
            return 'Failed to set heart bit parameters'
        case OperatorType.SET_TASK_ACK:
            return 'Failed to set task parameters'
        case OperatorType.RESET_APB_ACK:
            return 'Failed to set reset apb parameters'
        case OperatorType.ACTIVATE_CREDENTIAL_ACK:
            return 'Failed to set activate credential parameters'
        default:
            return `Failed to Set(Get) ${operator} parameters`
    }
}
