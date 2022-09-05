/* eslint-disable no-unused-vars */
export enum ObjectKeyDiff {
    wg_type = 'interface type',
    component_source = 'Component Source',
    relay_mode = 'Relay mode',
    card_data_format_flags = 'card data format flags',
    keypad_mode = 'keypad mode',
    configuration = 'configuration',
    led_mode = 'led mode',
    offline_mode = 'offline mode'
}

export const objectValuesDiff = {
    wg_type: {
        0: 'wiegand 4',
        1: 'wiegand 8',
        2: 'wiegand 26',
        3: 'wiegand 34',
        4: 'wiegand 37',
        5: 'wiegand 40',
        6: 'wiegand 42'
    },
    direction: {
        0: 'entry',
        1: 'exit'
    },
    mode: {
        0: 'input',
        1: 'output'
    },
    relay_mode: {
        0: 'trigger',
        1: 'impulse'
    },
    type: {
        0: 'NO',
        1: 'NC'
    },
    card_data_format_flags: {
        '-1': 'Data 1/Data 0',
        0: 'ABA',
        1: '2000 bit binary',
        2: 'RAW format'
    },
    keypad_mode: {
        '-1': 'No Keypad Decoding Defined',
        0: '4-bit burst',
        1: '8-bit burst',
        2: '26-bit burst'
    },
    configuration: {
        0: 'Single reader',
        1: 'Multi readers'
    },
    led_mode: {
        0: 'LedMode1',
        1: 'LedMode2',
        2: 'LedMode3',
        3: 'LedMode4'
    },
    offline_mode: {
        0: 'Locked',
        1: 'Unlocked'
    }
}
