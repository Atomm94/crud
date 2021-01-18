import { acuInterfaceMode } from '../enums/acuInterfaceMode.enum'

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

export function checkAcuInterfaceMode (mode: string) {
    const values: any = Object.values(acuInterfaceMode)
    const check = values.includes(mode)
    return check
}

export function checkAcuInterfaceBaudRate (baud_rate: number) {
    const values: Array<number> = [2400, 4800, 9600, 14400, 19200, 28800, 38400, 56000]
    const check = values.includes(baud_rate)
    return check
}

export function interfaceValidation (data: any) {
    if (!('rs485_port_1' in data) || !('rs485_port_2' in data)) {
        return new Error('Invalid interface data')
    } else {
        if (typeof data.rs485_port_1 !== 'boolean' || typeof data.rs485_port_2 !== 'boolean') {
            return new Error('Invalid rs485_port status')
        } else {
            if (!checkAcuInterfaceMode(data.rs485_port_1.mode) || !checkAcuInterfaceMode(data.rs485_port_2.mode)) {
                return new Error('Invalid interface mode')
            } else {
                if (!checkAcuInterfaceBaudRate(data.rs485_port_1.baud_rate) || !checkAcuInterfaceBaudRate(data.rs485_port_2.baud_rate)) {
                    return new Error('Invalid interface Baud Rate')
                }
            }
        }
    }
    return true
}

export function timeValidation (data: any) {
    if (!('user_timezone' in data)) {
        return new Error('Invalid time data')
    } else {
        if (typeof data.user_timezone !== 'boolean') {
            return new Error('Invalid rs485_time status')
        } else {
            // const date = new Date()
            // const time_zone_default = Intl.DateTimeFormat().resolvedOptions().timeZone
            // const gmt = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(date).split(' ')[1]
            // const time_zone = time_zone_default + ' ' + gmt
        }
    }
    return true
}
