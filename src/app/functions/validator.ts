import { acuConnectionType } from '../enums/acuConnectionType.enum'
// import { AccessPoint } from '../model/entity/AccessPoint'
import acuModel from '../model/entity/acuModels.json'

export function ipValidation (string: string) {
    const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (string.match(ipformat)) {
        return true
    } else {
        return new Error('Invalid Ip address')
    }
}

export function networkValidation (data: any) {
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
        return new Error('Invalid network data')
    } else {
        if (Object.values(acuConnectionType).indexOf(data.connection_type) === -1) {
            return new Error('Invalid Connection type')
        } else {
            if (data.fixed === data.dhcp) {
                return new Error('check only Fixed or DHCP')
            } else {
                if (!ipValidation(data.ip_address)) {
                    return new Error('Invalid Ip address')
                } else if (!ipValidation(data.gateway)) {
                    return new Error('Invalid Gateway')
                } else if (!ipValidation(data.subnet_mask)) {
                    return new Error('Invalid Subnet mask')
                } else if (!ipValidation(data.dns_server)) {
                    return new Error('Invalid DNS server')
                } else {
                    // if (!Number(data.port)) {
                    //     return new Error('Invalid Port')
                    // } else {
                    return true
                    // }
                }
            }
        }
    }
}

export function interfaceValidation (data: any) {
    if (!('rs485_port_1' in data) || !('rs485_port_2' in data)) {
        return new Error('Invalid interface data')
    } else {
        if (typeof data.rs485_port_1 !== 'boolean' || typeof data.rs485_port_2 !== 'boolean') {
            return new Error('Invalid rs485_port status')
        } else {
            return true
        }
    }
}

export function timeValidation (data: any) {
    if (!('timezone_from_facility' in data) ||
        !('enable_daylight_saving_time' in data) ||
        !('daylight_saving_time_from_user_account' in data) ||
        typeof data.timezone_from_facility !== 'boolean' ||
        typeof data.enable_daylight_saving_time !== 'boolean' ||
        typeof data.daylight_saving_time_from_user_account !== 'boolean') {
        return new Error('Invalid time data')
    } else {
        if (data.timezone_from_facility === false) {
            if (!('time_zone' in data)) {
                return new Error('Invalid time_zone data')
            }
        }
    }
    return true
    // const date = new Date()
    // const time_zone_default = Intl.DateTimeFormat().resolvedOptions().timeZone
    // const gmt = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(date).split(' ')[1]
    // const time_zone = time_zone_default + ' ' + gmt
}

export function maintainValidation (data: any) {
    if (!('maintain_update_manual' in data)) {
        return new Error('Invalid maintain data')
    } else {
        if (typeof data.maintain_update_manual !== 'boolean') {
            return new Error('Invalid rs485_time status')
        } else {
            return true
        }
    }
}
export function checkAccessPointsValidation (data: any, acu_model: string) {
    const acu_models: any = acuModel

    const ports: any = {}
    const inputs: any = {}
    let inputs_count = 0
    const outputs: any = {}
    let outputs_count = 0
    const ext_devices: any = {}

    for (const access_point of data) {
        const type = access_point.type
        if (!acu_models.controllers[acu_model].access_point_types[type]) {
            return new Error(`device ${acu_model} cant have accessPoint like ${type}!`)
        } else {
            let resources: any = access_point.resources
            if (typeof resources === 'string') resources = JSON.parse(resources)
            for (const resource in resources) {
                if ('input' in resources[resource]) {
                    if (inputs[resources[resource].input]) {
                        return new Error('inputs must be different!')
                    } else {
                        inputs[resources[resource].input] = true
                        const component_source = resources[resource].component_source
                        if (component_source === 0) {
                            inputs_count++
                        } else {
                            const ext_device_input = resources[resource].input

                            if (ext_device_input > acu_models.expansion_boards.alarm_board['LR-IB16'].inputs) {
                                return new Error(`input cant be ${ext_device_input} of extention device ${component_source}!`)
                            } else {
                                if (!ext_devices[component_source]) {
                                    ext_devices[component_source] = { [ext_device_input]: true }
                                } else {
                                    if (ext_devices[component_source][ext_device_input]) {
                                        return new Error(`input ${ext_device_input} of extention device ${component_source} must be different!`)
                                    } else {
                                        ext_devices[component_source][ext_device_input] = true
                                    }
                                }
                            }
                        }
                    }
                }
                if (inputs_count > acu_models.controllers[acu_model].inputs) {
                    return new Error(`device model ${acu_model} inputs_count ${inputs_count} more than limit!`)
                }

                if ('output' in resources[resource]) {
                    if (outputs[resources[resource].output]) {
                        return new Error('outputs must be different!')
                    } else {
                        outputs[resources[resource].output] = true
                        const component_source = resources[resource].component_source
                        if (component_source === 0) {
                            outputs_count++
                        } else {
                            const ext_device_output = resources[resource].output

                            if (ext_device_output > acu_models.expansion_boards.relay_board['LR-RB16'].outputs) {
                                return new Error(`output cant be ${ext_device_output} of extention device ${component_source}!`)
                            } else {
                                if (!ext_devices[component_source]) {
                                    ext_devices[component_source] = { [ext_device_output]: true }
                                } else {
                                    if (ext_devices[component_source][ext_device_output]) {
                                        return new Error(`output ${ext_device_output} of extention device ${component_source} must be different!`)
                                    } else {
                                        ext_devices[component_source][ext_device_output] = true
                                    }
                                }
                            }
                        }
                    }
                }
                if (outputs_count > acu_models.controllers[acu_model].outputs) {
                    return new Error(`device model ${acu_model} outputs_count ${outputs_count} more than limit!`)
                }
            }

            for (const reader of access_point.readers) {
                if (!acu_models.controllers[acu_model].readers[reader.name]) {
                    return new Error(`device model ${acu_model} cant have reader ${reader.name}!`)
                } else {
                    if ('port' in reader) {
                        if (reader.port < 1 || reader.port > 4) {
                            return new Error(`reader port cant be ${reader.port}!`)
                        } else {
                            if (ports[reader.port]) {
                                return new Error('readers ports must be different!')
                            } else {
                                ports[reader.port] = true
                            }
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
