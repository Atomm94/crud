
export function entryReaderValidation (data: any) {
    if (!('component_source' in data) ||
        !('name' in data) ||
        !('direction' in data) ||
        !('interface_type' in data) ||
        !('interface' in data) ||
        !('mode' in data) ||
        !('reverse_byte_order' in data) ||
        !('enable_CRC' in data) ||
        !('enable_buzzer' in data) ||
        !('leave_zone' in data) ||
        !('coming_zone' in data) ||
        typeof data.reverse_byte_order !== 'boolean' ||
        typeof data.enable_buzzer !== 'boolean' ||
        typeof data.enable_CRC !== 'boolean' ||
        typeof data.leave_zone !== 'number'
    ) {
        return new Error('Invalid entryReader data')
    } else {
        if (data.direction !== 'entry' || data.direction !== 'exit') {
            return new Error('Invalid entryReader direction data')
        } else {
            if (data.interface_type !== 'Wiegand 4bit' || data.interface_type !== 'Wiegand 8bit' || data.interface_type !== ' Wiegand 26bit' || data.interface_type !== ' Wiegand 34bit') {
                return new Error('Invalid entryReader interface_type data')
            } else {
                if (data.mode !== 'input' || data.mode !== 'output' || data.mode !== 'wibus') {
                    return new Error('Invalid entryReader mode data')
                } else {
                    return true
                }
            }
        }
    }
}
export function exitButtonValidation (data: any) {
    if (!('component_source' in data) ||
        !('name' in data) ||
        !('condition' in data) ||
        !('input' in data) ||
        typeof data.input !== 'number') {
        return new Error('Invalid exitButton data')
    } else {
        if (data.condition !== 'close' || data.condition !== 'open' || data.condition !== 'change') {
            return new Error('Invalid exitButton condition data')
        } else {
            return true
        }
    }
}

export function lockValidation (data: any) {
    if (!('component_source' in data) ||
        !('name' in data) ||
        !('output' in data) ||
        !('relay_mode' in data) ||
        !('impulse_time' in data) ||
        !('type' in data) ||
        !('entry_exit_open_durations' in data) ||
        !('door_sensor_autolock' in data) ||
        typeof data.door_sensor_autolock !== 'boolean' ||
        typeof data.output !== 'number' ||
        typeof data.entry_exit_open_durations !== 'number'
    ) {
        return new Error('Invalid Lock data')
    } else {
        if (data.relay_mode !== 'trigger' || data.relay_mode !== 'impulse') {
            return new Error('Invalid Lock relay_mode data')
        } else {
            if (data.type !== 'NO' || data.type !== 'NC') {
                return new Error('Invalid Lock type data')
            }
        }
        return true
    }
}

export function emergencyOpenValidation (data: any) {
    if (!('component_source' in data) ||
        !('name' in data) ||
        !('condition' in data) ||
        !('input' in data) ||
        typeof data.input !== 'number') {
        return new Error('Invalid emergencyOpen data')
    } else {
        if (data.condition !== 'close' || data.condition !== 'open' || data.condition !== 'change') {
            return new Error('Invalid emergencyOpen condition data')
        } else {
            return true
        }
    }
}

// export function hubTumperValidation (data: any) {
//     if (!('component_source' in data) ||
//         !('name' in data) ||
//         !('condition' in data) ||
//         !('input' in data) ||
//         typeof data.input !== 'number') {
//         return new Error('Invalid hubTumper data')
//     } else {
//         if (data.condition !== 'close' || data.condition !== 'open' || data.condition !== 'change') {
//             return new Error('Invalid hubTumper condition data')
//         } else {
//             return true
//         }
//     }
// }

export function doorSensorValidation (data: any) {
    if (!('component_source' in data) ||
        !('name' in data) ||
        !('condition' in data) ||
        !('input' in data) ||
        !('alarm_settings' in data) ||
        typeof data.input !== 'number') {
        return new Error('Invalid doorSensor data')
    } else {
        if (data.condition !== 'close' || data.condition !== 'open' || data.condition !== 'change') {
            return new Error('Invalid doorSensor condition data')
        } else if (!('door_ajar' in data.alarm_settings) || !('door_forced_open' in data.alarm_settings)) {
            return new Error('Invalid doorSensor alarm_type data')
        } else if (
            !('enable_door_ajar_alarm' in data) ||
            typeof data.alarm_settings.door_ajar.enable_door_ajar_alarm !== 'boolean' ||
            !('door_ajar_time' in data) ||
            typeof data.alarm_settings.door_ajar.door_ajar_time !== 'number' ||
            !('trigger_output_if_door_ajar' in data) ||
            // Duration ???
            typeof data.alarm_settings.door_ajar.trigger_output_if_door_ajar !== 'string') {
            return new Error('Invalid doorSensor Door Ajar data')
        } else if (
            !('enable_door_forced_open_alarm' in data) ||
            typeof data.alarm_settings.door_forced_open.enable_door_forced_open_alarm !== 'boolean' ||
            !('trigger_output_if_door_forced_open' in data) ||
            typeof data.alarm_settings.door_forced_open.trigger_output_if_door_forced_open !== 'string' ||
            !('duration' in data) ||
            typeof data.alarm_settings.door_forced_open.duration !== 'number') {
            return new Error('Invalid doorSensor Door Forced-open data')
        } else {
            return true
        }
    }
}

export function outputAjarAlarmValidation (data: any) {
    if (!('component_source' in data) ||
        !('name' in data) ||
        !('output' in data) ||
        !('relay_mode' in data) ||
        !('impulse_time' in data) ||
        !('type' in data) ||
        typeof data.output !== 'number'
    ) {
        return new Error('Invalid Lock data')
    } else {
        if (data.relay_mode !== 'trigger' || data.relay_mode !== 'impulse') {
            return new Error('Invalid Lock relay_mode data')
        } else {
            if (data.type !== 'NO' || data.type !== 'NC') {
                return new Error('Invalid Lock type data')
            }
        }
        return true
    }
}
