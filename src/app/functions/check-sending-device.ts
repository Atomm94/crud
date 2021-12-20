
export function checkSendingDevice (old_data: any, new_data: any, fields_that_used_in_sending: Array<string> | null = null, required_fields: Array<string> = []) {
    if (!old_data || old_data === 'null') old_data = {}
    if (!new_data || new_data === 'null') new_data = {}

    if (typeof old_data === 'string') old_data = JSON.parse(old_data)
    if (typeof new_data === 'string') new_data = JSON.parse(new_data)
    old_data = JSON.parse(JSON.stringify(old_data))
    new_data = JSON.parse(JSON.stringify(new_data))

    const send_data: any = {}
    for (const [key, value_new] of Object.entries(new_data)) {
        let value_new_str = (value_new && typeof value_new === 'object') ? JSON.stringify(value_new) : value_new
        if (typeof value_new_str !== 'string') value_new_str = String(value_new_str)
        let value_old_str = (old_data[key] && typeof old_data[key] === 'object') ? JSON.stringify(old_data[key]) : old_data[key]
        if (typeof value_old_str !== 'string') value_old_str = String(value_old_str)

        if (value_new_str !== value_old_str) {
            if (!fields_that_used_in_sending || fields_that_used_in_sending.includes(key)) {
                send_data[key] = value_new
            } else {
                required_fields.push(key)
            }
        }
    }
    if (!fields_that_used_in_sending) {
        for (const key in old_data) {
            if (!(key in new_data)) {
                send_data[key] = -1
            }
        }
    }
    let check_update = false
    if (Object.keys(send_data).length) check_update = true

    if (check_update) {
        if (new_data.id) send_data.id = new_data.id
        for (const required_field of required_fields) {
            if (required_field in new_data) send_data[required_field] = new_data[required_field]
        }
    }

    return check_update ? send_data : false
}
