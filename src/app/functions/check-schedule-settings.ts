
import { scheduleType } from '../enums/scheduleType.enum'
import { Schedule } from '../model/entity'
import { Timeframe } from '../model/entity/Timeframe'

export class CheckScheduleSettings {
    public static checkSettings (type: scheduleType, schedule: Schedule, timeframe:Timeframe) {
        let check: any = false
        switch (type) {
            case 'daily':
                check = this.checkDailysettings(schedule, timeframe)
                break
            case 'weekly':
                check = this.checkWeeklysettings(schedule, timeframe)
                break
            case 'specific':
                check = this.checkSpecificsettings(schedule, timeframe)
                break
            case 'flexitime':
                check = this.checkFlexitimesettings(schedule, timeframe)
                break
            default:
                break
        }
        return check
    }

    public static checkDailysettings (schedule: any, timeframe:any) {
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return 'Invalid schedule data'
        } else {
            if (schedule.type !== scheduleType.DAILY) {
                return 'Invalid schedule data'
            } else {
                //     if (Object.values(weekDays).indexOf(timeframe.name) === -1) {
                //         return 'Invalid week days '
                //     }
                if (!Number(timeframe.name)) {
                    return 'Invalid week days '
                } else {
                    if (timeframe.end < timeframe.start) {
                        return 'End time cant be less than start'
                    } else {
                        return true
                    }
                }
            }
        }
    }

    public static checkWeeklysettings (schedule: any, timeframe:any) {
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return 'Invalid schedule data'
        } else {
            if (schedule.type !== scheduleType.WEEKLY) {
                return 'Invalid schedule data'
            } else {
                if (!Number(timeframe.name)) {
                    return 'Invalid week days '
                } else {
                    if (timeframe.end < timeframe.start) {
                        return 'End time cant be less than start'
                    } else {
                        return true
                    }
                }
            }
        }
    }

    public static checkSpecificsettings (schedule: any, timeframe:any) {
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return 'Invalid schedule data'
        } else {
            if (schedule.type !== scheduleType.SPECIFIC) {
                return 'Invalid schedule data'
            } else {
                // const date = timeframe.name.split('-').reverse().join('-')
                if (!new Date(schedule.name)) {
                    return 'Invalid week days '
                } else {
                    if (timeframe.end < timeframe.start) {
                        return 'End time cant be less than start'
                    } else {
                        return true
                    }
                }
            }
        }
    }

    public static checkFlexitimesettings (schedule: any, timeframe:any) {
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return 'Invalid schedule data'
        } else {
            if (schedule.type !== scheduleType.SPECIFIC) {
                return 'Invalid schedule data'
            } else {
                // const start_from = schedule.name.split('-').reverse().join('-')
                if (!new Date(schedule.name)) {
                    return 'Invalid week days '
                } else {
                    if (!Number(timeframe.name)) {
                        return 'Invalid week days '
                    } else {
                        if (timeframe.end < timeframe.start) {
                            return 'End time cant be less than start'
                        } else {
                            return true
                        }
                    }
                }
            }
        }
    }
}
