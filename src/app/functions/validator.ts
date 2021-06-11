import { acuConnectionType } from '../enums/acuConnectionType.enum'
import { standartReportPeriod } from '../enums/standartReportPeriod.enum'

import { autoTaskRepeatUnit } from '../enums/autoTaskRepeatUnit.enum'
import { autoTaskScheduleType } from '../enums/autoTaskScheduleType.enum'
import { readerTypes } from '../enums/readerTypes'
// import { AccessPoint } from '../model/entity/AccessPoint'
import acuModel from '../model/entity/acuModels.json'
import autoTaskcommands from '../model/entity/autoTaskcommands.json'
import { wiegandTypes } from '../enums/wiegandTypes'
import { extBrdInterface } from '../enums/extBrdInterface.enum'

export function ipValidation(string: string) {
    const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (string.match(ipformat)) {
        return true
    } else {
        return ('Invalid Ip address')
    }
}

export function networkValidation(data: any) {
    if (!('connection_type' in data) ||
        !('ip_address' in data) ||
        !('gateway' in data) ||
        !('subnet_mask' in data) ||
        !('dns_server' in data) ||
        // !('port' in data) ||
        !('fixed' in data) ||
        !('dhcp' in data) ||
        typeof data.fixed !== 'boolean' ||
        typeof data.dhcp !== 'boolean') {
        return ('Invalid network data')
    } else {
        if (Object.values(acuConnectionType).indexOf(data.connection_type) === -1) {
            return ('Invalid Connection type')
        } else {
            if (data.fixed === data.dhcp) {
                return ('check only Fixed or DHCP')
            } else {
                if (!ipValidation(data.ip_address)) {
                    return ('Invalid Ip address')
                } else if (!ipValidation(data.gateway)) {
                    return ('Invalid Gateway')
                } else if (!ipValidation(data.subnet_mask)) {
                    return ('Invalid Subnet mask')
                } else if (!ipValidation(data.dns_server)) {
                    return ('Invalid DNS server')
                } else {
                    // if (!Number(data.port)) {
                    //     return ('Invalid Port')
                    // } else {
                    return true
                    // }
                }
            }
        }
    }
}

export function interfaceValidation(data: any) {
    if (!('rs485_port_1' in data) || !('rs485_port_2' in data)) {
        return ('Invalid interface data')
    } else {
        if (typeof data.rs485_port_1 !== 'boolean' || typeof data.rs485_port_2 !== 'boolean') {
            return ('Invalid rs485_port status')
        } else {
            return true
        }
    }
}

export function timeValidation(data: any) {
    if (!('timezone_from_facility' in data) ||
        !('enable_daylight_saving_time' in data) ||
        !('daylight_saving_time_from_user_account' in data) ||
        typeof data.timezone_from_facility !== 'boolean' ||
        typeof data.enable_daylight_saving_time !== 'boolean' ||
        typeof data.daylight_saving_time_from_user_account !== 'boolean') {
        return ('Invalid time data')
    } else {
        if (data.timezone_from_facility === false) {
            if (!('time_zone' in data)) {
                return ('Invalid time_zone data')
            }
        }
    }
    return true
    // const date = new Date()
    // const time_zone_default = Intl.DateTimeFormat().resolvedOptions().timeZone
    // const gmt = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(date).split(' ')[1]
    // const time_zone = time_zone_default + ' ' + gmt
}

export function maintainValidation(data: any) {
    if (!('maintain_update_manual' in data)) {
        return ('Invalid maintain data')
    } else {
        if (typeof data.maintain_update_manual !== 'boolean') {
            return ('Invalid rs485_time status')
        } else {
            return true
        }
    }
}

export function checkAccessPointsValidation(data: any, acu_model: string, update: boolean) {
    const acu_models: any = acuModel

    const int_ports_addrs: any = {} // interface, port, address - is unique
    const inputs: any = {}
    let inputs_count = 0
    const outputs: any = {}
    let outputs_count = 0
    const ext_devices: any = {}

    for (const access_point of data) {
        const type = access_point.type
        if (type && !acu_models.controllers[acu_model].access_point_types[type]) {
            return (`device ${acu_model} cant have accessPoint like ${type}!`)
        } else {
            let resources: any = access_point.resources
            if (typeof resources === 'string') resources = JSON.parse(resources)
            for (const resource in resources) {
                const component_source = resources[resource].component_source
                if (!update && component_source !== 0) {
                    return ('in Component Source you cant set ext_device before add ACU!')
                }
                if ('input' in resources[resource]) {
                    if (inputs[resources[resource].input]) {
                        return ('inputs must be different!')
                    } else {
                        inputs[resources[resource].input] = true
                        if (component_source === 0) {
                            inputs_count++
                        } else {
                            const ext_device_input = resources[resource].input

                            if (ext_device_input > acu_models.expansion_boards.alarm_board['LR-IB16'].inputs) {
                                return (`input cant be ${ext_device_input} of extention device ${component_source}!`)
                            } else {
                                if (!ext_devices[component_source]) {
                                    ext_devices[component_source] = { [ext_device_input]: true }
                                } else {
                                    if (ext_devices[component_source][ext_device_input]) {
                                        return (`input ${ext_device_input} of extention device ${component_source} must be different!`)
                                    } else {
                                        ext_devices[component_source][ext_device_input] = true
                                    }
                                }
                            }
                        }
                    }
                }
                if (inputs_count > acu_models.controllers[acu_model].inputs) {
                    return (`device model ${acu_model} inputs_count ${inputs_count} more than limit!`)
                }

                if ('output' in resources[resource]) {
                    if (outputs[resources[resource].output]) {
                        return ('outputs must be different!')
                    } else {
                        outputs[resources[resource].output] = true
                        if (component_source === 0) {
                            outputs_count++
                        } else {
                            const ext_device_output = resources[resource].output

                            if (ext_device_output > acu_models.expansion_boards.relay_board['LR-RB16'].outputs) {
                                return (`output cant be ${ext_device_output} of extention device ${component_source}!`)
                            } else {
                                if (!ext_devices[component_source]) {
                                    ext_devices[component_source] = { [ext_device_output]: true }
                                } else {
                                    if (ext_devices[component_source][ext_device_output]) {
                                        return (`output ${ext_device_output} of extention device ${component_source} must be different!`)
                                    } else {
                                        ext_devices[component_source][ext_device_output] = true
                                    }
                                }
                            }
                        }
                    }
                }
                if (outputs_count > acu_models.controllers[acu_model].outputs) {
                    return (`device model ${acu_model} outputs_count ${outputs_count} more than limit!`)
                }
            }

            for (const reader of access_point.readers) {
                if (reader.type && !acu_models.controllers[acu_model].readers[readerTypes[reader.type]]) {
                    return (`device model ${acu_model} cant have reader ${readerTypes[reader.type]}!`)
                } else {
                    if (!('wg_type' in reader) || reader.wg_type === null ) {
                        return ('reader interface type is required!')
                    } else {
                        if ('port' in reader) {
                            if (reader.port < 1 || reader.port > 4) {
                                return (`wiegand reader port cant be ${reader.port}, it must be (1-4)!`)
                            } else {
                                if (reader.wg_type === wiegandTypes.OSDP) {
                                    if (!('osdp_data' in reader) || !('osdp_address' in reader)) {
                                        return ('readers(OSDP) osdp_data and osdp_address is required!')
                                    } else {
                                        if (reader.osdp_address < 1 || reader.osdp_address > 128) {
                                            return (`OSDP reader address cant be ${reader.osdp_address}, it must be (1-128)!`)
                                        } else {
                                            if (!int_ports_addrs.osdp) int_ports_addrs.osdp = {}
                                            if (!int_ports_addrs.osdp[reader.port]) {
                                                int_ports_addrs.osdp[reader.port] = { [reader.osdp_address]: true }
                                            } else {
                                                if (int_ports_addrs.osdp[reader.port][reader.osdp_address]) {
                                                    return (`readers(OSDP) port - ${reader.port}, address - ${reader.osdp_address} must be different!`)
                                                } else {
                                                    int_ports_addrs.osdp[reader.port][reader.osdp_address] = true
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (!int_ports_addrs.wiegand) int_ports_addrs.wiegand = {}

                                    if (int_ports_addrs.wiegand[reader.port]) {
                                        return (`readers(Wiegand) ports must be different (${reader.port} repeated)!`)
                                    } else {
                                        int_ports_addrs.wiegand[reader.port] = true
                                    }
                                }
                            }
                        } else {
                            return ('reader port is required!')
                        }
                    }
                }
            }
            // Object.values(resources).forEach((resource: any) => {
            // })
        }
    }
    return true
}

export function checkExtDeviceValidation(data: any) {
    if (data.interface === extBrdInterface.RS485) {
        if (data.port < 1 || data.port > 4) {
            return (`RS485 port cant be ${data.port}, it must be (1-4)!`)
        } else {
            if (data.address < 1 || data.address > 254) {
                return (`RS485 address cant be ${data.address}, it must be (1-254)!`)
            }
        }
    } else if (data.interface === extBrdInterface.ETHERNET) {
        if (data.port < 1 || data.port > 65535) {
            return (`Ethernet port cant be ${data.port}, it must be (1-65535)!`)
        }
    } else {
        return (`Invalid interface ${data.interface}!`)
    }
    return true
}

export function standartReportPeriodValidation(data: any) {
    if (!('key' in data) || !('value' in data)) {
        return ('Invalid period data!')
    } else {
        switch (data.key) {
            case standartReportPeriod.CURRENT_DAY:
            case standartReportPeriod.CURRENT_WEEK:
            case standartReportPeriod.CURRENT_MONTH:
            case standartReportPeriod.PREVIOUS_DAY:
            case standartReportPeriod.PREVIOUS_WEEK:
            case standartReportPeriod.PREVIOUS_MONTH:
                break
            case standartReportPeriod.TARGET_DAY:
                if (!new Date(data.value)) {
                    return (`Invalid value for period ${data.key}!`)
                }
                break
            case standartReportPeriod.TARGET_MONTH:
                if (!new Date(data.value)) {
                    return (`Invalid value for period ${data.key}!`)
                }
                break
            case standartReportPeriod.TARGET_PERIOD:
                if (!data.value.start_date || !data.value.end_date) {
                    return (`Invalid value for period ${data.key}!`)
                } else {
                    if (!new Date(data.value.start_date) || !new Date(data.value.end_date)) {
                        return (`Invalid value for period ${data.key}!`)
                    }
                }
                break

            default:
                return (`Cant find period like ${data.key}!`)
        }
    }
    return true
}

export function autoTaskScheduleValidation(data: any) {
    if (data.schedule_type === autoTaskScheduleType.CUSTOM_SCHEDULE) {
        if (!data.custom_schedule) {
            return ('set Custom Schedule data')
        } else {
            if (!('start_date' in data.custom_schedule) ||
                !('start_date_enable' in data.custom_schedule) ||
                !('end_date' in data.custom_schedule) ||
                !('end_date_enable' in data.custom_schedule) ||
                !('start_time' in data.custom_schedule) ||
                !('start_time_enable' in data.custom_schedule) ||
                !('end_time' in data.custom_schedule) ||
                !('end_time_enable' in data.custom_schedule) ||
                !('repeat' in data.custom_schedule) ||
                !('repeat_interval' in data.custom_schedule) ||
                !('repeat_unit' in data.custom_schedule) ||
                !('duration_days' in data.custom_schedule) ||
                !('unlimited' in data.custom_schedule)) {
                return ('Invalid Custom Schedule data')
            } else {
                if (!new Date(data.custom_schedule.start_date) || !new Date(data.custom_schedule.end_date)) {
                    return ('Invalid start_date or end_date in Custom Schedule')
                } else if (!Number(data.custom_schedule.repeat_interval) || !Number(data.custom_schedule.duration_days)) {
                    return ('repeat_interval, duration_days must be number!')
                } else if (Object.values(autoTaskRepeatUnit).indexOf(data.custom_schedule.repeat_unit) === -1) {
                    return ('Invalid Repeat Unit in Custom Schedule data')
                }
            }
        }
    }

    const auto_task_commands: any = autoTaskcommands
    if (data.command) {
        if (!Array.isArray(data.command)) {
            return ('AutoTaskSchedule command must be Array')
        } else {
            for (const command_id of data.command) {
                if (!auto_task_commands[command_id]) {
                    return ('AutoTaskSchedule Invalid command id')
                }
            }
        }
    }
    return true
}
