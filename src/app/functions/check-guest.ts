
import { cloneDeep } from 'lodash'
import moment from 'moment'
import { companyDayKeys } from '../enums/companyDayKeys.enum'
import { guestKeyType } from '../enums/guestKeyType.enum'
import { guestPeriod } from '../enums/guestPeriod.enum'
import { Company, Credential } from '../model/entity'

export class CheckGuest {
    public static async checkSaveGuest (guest_data: any, company: Company, invite_user: any) {
        guest_data = cloneDeep(guest_data)
        if (!company.base_schedules) {
            return 'Base Schedule not setted!'
        }
        const access_point_ids = guest_data.access_points
        if (!access_point_ids || !access_point_ids.length) {
            return 'Choose AccessPoints!'
        } else {
            for (const access_point_id of access_point_ids) {
                let check_access_point = false
                for (const access_rule of invite_user.access_rights.access_rules) {
                    if (access_rule.access_point === access_point_id) check_access_point = true
                }
                if (!check_access_point) return 'Invalid AccessPoint id!'
            }
        }

        if (company.require_name_of_guest) {
            if (!guest_data.first_name) {
                return 'First_name is required!'
            }
        }
        if (guest_data.key_type === guestKeyType.TEMPORARY) {
            if (guest_data.set_key) {
                return `you cant set Key with key_type ${guest_data.key_type}!`
            }
            if (guest_data.period === guestPeriod.HOURS) {
                if (!guest_data.duration) {
                    return 'You must set duration!'
                } else if (!guest_data.start_date) {
                    return 'You must set start_date!'
                } else if (!(new Date(guest_data.start_date))) {
                    return 'Invalid start_date!'
                }

                const end_date_timestamp = new Date(guest_data.start_date).getTime() + guest_data.duration * 60 * 1000
                guest_data.end_date = moment(end_date_timestamp).format('YYYY-MM-DD HH:mm:ss')
            } else if (guest_data.period === guestPeriod.DAYS) {
                if (!guest_data.start_date) {
                    return 'You must set start_date!'
                } else if (!(new Date(guest_data.start_date))) {
                    return 'Invalid start_date!'
                } else if (!guest_data.end_date) {
                    return 'You must set end_date!'
                } else if (!(new Date(guest_data.end_date))) {
                    return 'Invalid end_date!'
                }

                const start_date_timestamp = new Date(guest_data.start_date).getTime()
                const end_date_timestamp = new Date(guest_data.end_date).getTime()
                const diff_start_end = end_date_timestamp - start_date_timestamp
                if (diff_start_end < 0) {
                    return 'end_date can\'t less then start_date!'
                }
                switch (company.day_keys) {
                    case companyDayKeys.UP_TO_5_DAYS:
                        if (diff_start_end > 5 * 24 * 60 * 60 * 1000) {
                            return `difference between end_date and start_date wrong.. base config is ${company.day_keys}!`
                        }
                        break
                    case companyDayKeys.UP_TO_10_DAYS:
                        if (diff_start_end > 10 * 24 * 60 * 60 * 1000) {
                            return `difference between end_date and start_date wrong.. base config is ${company.day_keys}!`
                        }
                        break
                    case companyDayKeys.UP_TO_1_MONTH:
                        if (diff_start_end > 31 * 24 * 60 * 60 * 1000) {
                            return `difference between end_date and start_date wrong.. base config is ${company.day_keys}!`
                        }
                        break
                    case companyDayKeys.NO_LIMIT:
                    default:
                        break
                }
            } else {
                return `Invalid period - ${guest_data.period}!`
            }
            const check_times = this.checkTemporaryIntersectionOfTimeframes(company, guest_data.start_date, guest_data.end_date)

            if (check_times !== true) {
                return check_times
            }
        } else if (guest_data.key_type === guestKeyType.PERMANENT) {
            if (!guest_data.days_of_week || !guest_data.days_of_week.length) {
                return 'Invalid days_of_week!'
            } else {
                for (const day_of_week of guest_data.days_of_week) {
                    if (day_of_week < 1 || day_of_week > 7) return `Invalid day of week - ${day_of_week}!`
                }
            }
            if (!guest_data.start_time) {
                return 'You must set start_time!'
            } else if (!guest_data.end_time) {
                return 'You must set end_time!'
            } else if (guest_data.end_time < guest_data.start_time) {
                return 'end_time cant be less start_time!'
            }
            if (!guest_data.selected_access_point) {
                return 'Select AccessPoint!'
            } else if (!access_point_ids.includes(guest_data.selected_access_point)) {
                return 'Invalid AccessPoint id for set Key!'
            }
            const check_times = this.checkPermanentIntersectionOfTimeframes(company, guest_data.days_of_week, guest_data.start_time, guest_data.end_time)
            if (check_times !== true) {
                return check_times
            }
        } else {
            return `Invalid key_type - ${guest_data.key_type}!`
        }

        return true
    }

    public static checkTemporaryIntersectionOfTimeframes (company: any, start_date: any, end_date: any) {
        const start_date_timestamp = new Date(start_date).getTime()
        const end_date_timestamp = new Date(end_date).getTime()
        const diff_start_end = end_date_timestamp - start_date_timestamp
        const one_day_timestamp = 24 * 60 * 60 * 1000

        if (diff_start_end < 7 * one_day_timestamp) {
            let need_timestamp = start_date_timestamp
            const start_day_of_month = new Date(start_date_timestamp).getDate()
            const end_day_of_month = new Date(end_date_timestamp).getDate()
            for (let i = 1; i <= 7; i++) {
                let need_day_of_week = new Date(need_timestamp).getDay()
                if (need_day_of_week === 0) need_day_of_week = 7 // for sunday
                const need_day_of_month = new Date(need_timestamp).getDate()
                if (need_day_of_month > end_day_of_month) break

                let start_time = moment(need_timestamp).format('HH:mm:ss')
                let end_time = '23:59:59'
                if (need_timestamp === start_date_timestamp) {
                    if (start_day_of_month === end_day_of_month) {
                        end_time = moment(end_date_timestamp).format('HH:mm:ss')
                    }
                } else {
                    start_time = '00:00:00'
                    if (end_day_of_month === need_day_of_month) {
                        end_time = moment(end_date_timestamp).format('HH:mm:ss')
                    }
                }

                for (const timeframe of company.base_schedules.timeframes) {
                    if (Number(timeframe.name) === need_day_of_week) {
                        if ((start_time >= timeframe.start && start_time <= timeframe.end) ||
                            (end_time >= timeframe.start && end_time <= timeframe.end) ||
                            (timeframe.start >= start_time && timeframe.start <= end_time) ||
                            (timeframe.end >= start_time && timeframe.end <= end_time)
                        ) {
                            return true
                        }
                    }
                }
                need_timestamp = new Date(start_date_timestamp + i * one_day_timestamp).getTime()
            }
        } else {
            if (company.base_schedules.timeframes.length) {
                return true
            }
        }
        return 'wrong Schedule, out of range base Schedule'
    }

    public static checkPermanentIntersectionOfTimeframes (company: any, days_of_week: any, start_time: any, end_time: any) {
        if (typeof days_of_week === 'string') days_of_week = JSON.parse(days_of_week)
        for (const day_of_week of days_of_week) {
            let check_day_in_base_schedule = false
            let check_times_range = false
            for (const timeframe of company.base_schedules.timeframes) {
                if (Number(timeframe.name) === Number(day_of_week)) {
                    check_day_in_base_schedule = true
                    if (start_time >= timeframe.start && end_time <= timeframe.end) {
                        check_times_range = true
                    }
                }
            }
            if (!check_day_in_base_schedule || !check_times_range) return 'wrong Schedule, out of range base Schedule'
        }
        return true
    }

    public static async tryGeneratePinpassCode (company: number, try_qty: number = 0): Promise<any> {
        const rand = Math.floor(Math.random() * 9999)
        let code = rand.toString()
        const code_length = code.length
        for (let i = 0; i < 6 - code_length; i++) {
            code = `0${code}`
        }
        const credential = await Credential.findOne({ where: { company, code } })
        if (!credential) {
            return code
        } else {
            try_qty++
            if (try_qty < 10) {
                return this.tryGeneratePinpassCode(company, try_qty)
            } else {
                throw new Error('Dublicate pinpass credentials!')
            }
        }
    }
}
