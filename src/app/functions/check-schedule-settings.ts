
import { isNumber } from 'lodash'
import { scheduleType } from '../enums/scheduleType.enum'
import { Timeframe } from '../model/entity/Timeframe'

export class CheckScheduleSettings {
    public static checkSettings (type: scheduleType, schedule: any) {
        let check: any = false
        switch (type) {
            case 'daily':
                check = this.checkDailysettings(schedule)
                break
            case 'weekly':
                check = this.checkWeeklysettings(schedule)
                break
            case 'specific':
                check = this.checkSpecificsettings(schedule)
                break
            case 'flexitime':
                check = this.checkFlexitimesettings(schedule)
                break
            default:
                break
        }
        return check
    }

    public static async checkDailysettings (schedule: any) {
        const timeframe: any = Timeframe.findOne({ schedule: schedule.id })
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return new Error('Invalid schedule data')
        } else {
            if (schedule.type !== scheduleType.DAILY) {
                return new Error('Invalid schedule data')
            } else {
                //     if (Object.values(weekDays).indexOf(timeframe.name) === -1) {
                //         return new Error('Invalid week days ')
                //     }
                if (!isNumber(timeframe.name)) {
                    return new Error('Invalid week days ')
                } else {
                    if (timeframe.end < timeframe.start) {
                        return new Error('End time cant be less than start')
                    } else {
                        return true
                    }
                }
            }
        }
    }

    public static checkWeeklysettings (schedule: any) {
        const timeframe: any = Timeframe.findOne({ schedule: schedule.id })
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return new Error('Invalid schedule data')
        } else {
            if (schedule.type !== scheduleType.WEEKLY) {
                return new Error('Invalid schedule data')
            } else {
                if (!isNumber(timeframe.name)) {
                    return new Error('Invalid week days ')
                } else {
                    if (timeframe.end < timeframe.start) {
                        return new Error('End time cant be less than start')
                    } else {
                        return true
                    }
                }
            }
        }
    }

    public static checkSpecificsettings (schedule: any) {
        const timeframe: any = Timeframe.findOne({ schedule: schedule.id })
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return new Error('Invalid schedule data')
        } else {
            if (schedule.type !== scheduleType.SPECIFIC) {
                return new Error('Invalid schedule data')
            } else {
                // const date = timeframe.name.split('-').reverse().join('-')
                if (!new Date(schedule.name)) {
                    return new Error('Invalid week days ')
                } else {
                    if (timeframe.end < timeframe.start) {
                        return new Error('End time cant be less than start')
                    } else {
                        return true
                    }
                }
            }
        }
    }

    public static checkFlexitimesettings (schedule: any) {
        const timeframe: any = Timeframe.findOne({ schedule: schedule.id })
        if (!('type' in schedule) ||
            !('name' in schedule) ||
            typeof schedule.type !== 'string' ||
            typeof schedule.name !== 'string') {
            return new Error('Invalid schedule data')
        } else {
            if (schedule.type !== scheduleType.SPECIFIC) {
                return new Error('Invalid schedule data')
            } else {
                // const start_from = schedule.name.split('-').reverse().join('-')
                if (!new Date(schedule.name)) {
                    return new Error('Invalid week days ')
                } else {
                    if (!isNumber(timeframe.name)) {
                        return new Error('Invalid week days ')
                    } else {
                        if (timeframe.end < timeframe.start) {
                            return new Error('End time cant be less than start')
                        } else {
                            return true
                        }
                    }
                }
            }
        }
    }
}
