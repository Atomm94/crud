export function ipValidation (string: string) {
    const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (string.match(ipformat)) {
        return true
    } else {
        return new Error('Invalid Ip address')
    }
}

export function networkValidation (data: any, connection_type?: string) {
    if (!('ip_address' in data) ||
        !('gateway' in data) ||
        !('subnet_mask' in data) ||
        !('dns_server' in data) ||
        !('port' in data) ||
        !('fixed' in data) ||
        !('dhcp' in data) ||
        typeof data.fixed !== 'boolean' ||
        typeof data.dhcp !== 'boolean') {
        return new Error('Invalid network data')
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
                if (!Number(data.port)) {
                    return new Error('Invalid Port')
                } else {
                    return true
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
