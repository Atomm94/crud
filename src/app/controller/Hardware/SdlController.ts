import { scheduleType } from '../../enums/scheduleType.enum'
import { Schedule } from '../../model/entity'
import { Timeframe } from '../../model/entity/Timeframe'
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class SdlController {
    public static async setSdl (location: string, serial_number: number, access_rule: any, session_id: string | null = '0') {
        const schedule: Schedule = await Schedule.findOneOrFail({ id: access_rule.schedule })
        const timeframes = await Timeframe.find({ schedule: schedule.id })
        const send_sdl_data: any = { ...access_rule, timeframes: timeframes }
        let operator: OperatorType = OperatorType.SET_SDL_DAILY
        if (schedule.type === scheduleType.WEEKLY) {
            operator = OperatorType.SET_SDL_WEEKLY
        } else if (schedule.type === scheduleType.FLEXITIME) {
            send_sdl_data.start_from = schedule.start_from
            operator = OperatorType.SET_SDL_FLEXI_TIME
        } else if (schedule.type === scheduleType.SPECIFIC) {
            operator = OperatorType.SET_SDL_SPECIFIED
        }
        new SendDeviceMessage(operator, location, serial_number, send_sdl_data, session_id)
    }

    public static async delSdl (location: string, serial_number: number, data: any, session_id: string | null = '0') {
        // new SendDeviceMessage(OperatorType.DEL_RD, location, serial_number, data, session_id)
    }
}
