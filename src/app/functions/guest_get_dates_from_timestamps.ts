import moment from 'moment'

export async function guestGetDatesFromTimestamps (guest: any) {
    if (guest.start_timestamp) {
        guest.start_date = moment(guest.start_timestamp).format('YYYY-MM-DD')
        guest.start_time = moment(guest.start_timestamp).format('HH:mm:ss')
    }
    if (guest.end_timestamp) {
        guest.end_date = moment(guest.end_timestamp).format('YYYY-MM-DD')
        guest.end_time = moment(guest.end_timestamp).format('HH:mm:ss')
    }
    return true
}
