import { scheduleType } from '../enums/scheduleType.enum'
import { AccessRight, Schedule } from '../model/entity'
import { CardholderGroup } from '../model/entity/CardholderGroup'
import { Limitation } from '../model/entity/Limitation'
import { Timeframe } from '../model/entity/Timeframe'

export async function addDefaultFeaturesofCompany (company: number) {
    try {
        const access_right_data: any = {
            company: company,
            name: `default_Access_Right_${company}`,
            default: true
        }
        const access_right: any = await AccessRight.addItem(access_right_data)
        const limitation_data = {
            enable_date: false,
            pass_counter_enable: false,
            first_use_counter_enable: false,
            last_use_counter_enable: false
        }
        const limitation = await Limitation.addItem(limitation_data as Limitation)
        const schedule_data: any = {
            type: scheduleType.DAILY,
            name: `default_Schedule_${company}`,
            company: company
        }

        const schedule: any = await Schedule.addItem(schedule_data)
        const timeframe_data: any = {
            name: 1,
            schedule: schedule.id,
            start: '00:00:00',
            end: '23:59:59',
            company: company
        }
        await Timeframe.addItem(timeframe_data)
        const cardholder_group_data: any = {
            company: company,
            name: 'All Cardholders',
            access_right: access_right.id,
            enable_antipass_back: false,
            time_attendance: schedule.id

        }
        if (limitation_data) {
            cardholder_group_data.limitation = limitation.id
        }

        await CardholderGroup.addItem(cardholder_group_data)
        return {
            message: 'Success'
        }
    } catch (error) {
        return error
    }
}
