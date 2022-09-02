export enum ObjectKeyDiff {
    wg_type = 'interface type',
    component_source = 'Component Source',
    relay_mode = 'Relay mode'
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
    }
}
