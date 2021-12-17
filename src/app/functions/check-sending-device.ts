
export function checkSendingDevice (old_data: any, new_data: any, fields_that_used_in_sending: Array<string> | null = null, required_fields: Array<string> = []) {
    if (typeof old_data === 'string') old_data = JSON.parse(old_data)
    if (typeof new_data === 'string') new_data = JSON.parse(new_data)

    const send_data: any = {}
    for (const [key, value_new] of Object.entries(new_data)) {
        if (value_new !== old_data[key]) {
            if (!fields_that_used_in_sending || fields_that_used_in_sending.includes(key)) {
                send_data[key] = value_new
            } else {
                required_fields.push(key)
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
