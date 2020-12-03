
import { scheduleType } from '../enums/scheduleType.enum'

export class CheckScheduleSettings {
    public static checkSettings (type: scheduleType, settings: any) {
        let check: any = false
        switch (type) {
            case 'daily':
                check = this.checkDailysettings(settings)
                break
            case 'weekly':
                check = this.checkWeeklysettings(settings)
                break
            case 'specific':
                check = this.checkSpecificsettings(settings)
                break
            case 'flexitime':
                check = this.checkFlexitimesettings(settings)
                break
            case 'ordinal':
                check = this.checkOrdinalsettings(settings)
                break

            default:
                break
        }
        return check
    }

    public static checkDailysettings (settings: any) {
        return true
    }

    public static checkWeeklysettings (settings: any) {
        return true
    }

    public static checkSpecificsettings (settings: any) {
        return true
    }

    public static checkFlexitimesettings (settings: any) {
        return true
    }

    public static checkOrdinalsettings (settings: any) {
        return true
    }
}
