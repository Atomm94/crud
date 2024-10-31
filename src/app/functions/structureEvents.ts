const structuredEvents: any = []

export default (events: any) => {
    for (const event of events.split('/')) {
        if (event) {
            const eventColumns = event.split(';')

            structuredEvents.push({
                Group: eventColumns[0],
                Ctp_idx: eventColumns[1],
                Event_id: eventColumns[2],
                Key_id: eventColumns[3],
                Key_HEX: eventColumns[4],
                time: eventColumns[5]
            })
        }
    }

    return structuredEvents
}
