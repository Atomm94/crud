import { scheduleType } from '../../enums/scheduleType.enum'
import { Schedule } from '../../model/entity'
import { Timeframe } from '../../model/entity/Timeframe'
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class SdlController {
    public static async setSdl (location: string, serial_number: number, access_rule: any, user: any, session_id: string | null = '0', update: boolean = false, send_data: any = null) {
        let schedule: any
        if (access_rule.schedules) {
            schedule = access_rule.schedules
        } else {
            // schedule = await Schedule.findOneOrFail({ where: { id: access_rule.schedule }, relations: ['timeframes'] })
            schedule = await Schedule.createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.timeframes', 'timeframe', 'timeframe.delete_date is null')
                .where(`schedule.id = '${access_rule.schedule}'`)
                .getOne()
        }

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
        new SendDeviceMessage(operator, location, serial_number, send_sdl_data, user, session_id, update)
    }

    public static async delSdl (location: string, serial_number: number, send_data: any, user: any, type: scheduleType, session_id: string | null = '0', update: boolean = false) {
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
