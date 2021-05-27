import { scheduleType } from '../../enums/scheduleType.enum'
import { Schedule } from '../../model/entity'
import { Timeframe } from '../../model/entity/Timeframe'
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class SdlController {
    public static async setSdl (location: string, serial_number: number, access_rule: any, user: number | null = null, session_id: string | null = '0', send_data: any = null) {
        const schedule: Schedule = (access_rule.schedules) ? access_rule.schedules : await Schedule.findOneOrFail({ where: { id: access_rule.schedule }, relations: ['timeframes'] })

        let send_sdl_data
        if (send_data) {
            send_sdl_data = send_data
        } else {
            const timeframes = (schedule.timeframes) ? schedule.timeframes : await Timeframe.find({ schedule: schedule.id })
            send_sdl_data = { ...access_rule, timeframes: timeframes }
        }

        let operator: OperatorType = OperatorType.SET_SDL_DAILY
        if (schedule.type === scheduleType.WEEKLY) {
            operator = OperatorType.SET_SDL_WEEKLY
        } else if (schedule.type === scheduleType.FLEXITIME) {
            send_sdl_data.start_from = schedule.start_from
            operator = OperatorType.SET_SDL_FLEXI_TIME
        } else if (schedule.type === scheduleType.SPECIFIC) {
            operator = OperatorType.SET_SDL_SPECIFIED
        }
        new SendDeviceMessage(operator, location, serial_number, send_sdl_data, user, session_id)
    }

    public static async delSdl (location: string, serial_number: number, send_data: any, user: number | null = null, type: scheduleType, session_id: string | null = '0', update: boolean = false) {
        let operator: OperatorType = OperatorType.DEL_SDL_DAILY
        if (type === scheduleType.WEEKLY) {
            operator = OperatorType.DEL_SDL_WEEKLY
        } else if (type === scheduleType.FLEXITIME) {
            operator = OperatorType.DEL_SDL_FLEXI_TIME
        } else if (type === scheduleType.SPECIFIC) {
            operator = OperatorType.DEL_SDL_SPECIFIED
        }
        new SendDeviceMessage(operator, location, serial_number, send_data, user, session_id, update)
    }
}
