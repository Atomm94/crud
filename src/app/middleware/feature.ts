import { DefaultContext } from 'koa'
import { AccessControl } from '../functions/access-control'
interface IFeature {
    check: (ctx: DefaultContext, next: () => Promise<void>) => void,
    model?: string,
    module?: boolean
}
interface IFeatureModel {
    [featureName: string]: IFeature
}
class Feature {
    public static Cardholder: IFeatureModel = {
        CardholderGroupOperation: {
            check: CardholderGroupOperationCheck,
            model: 'CardholderGroup',
            module: true
        },
        CardholderGroupAccessRight: {
            check: CardholderGroupAccessRightCheck,
            model: 'CardholderGroup'
        },
        CardholderDeactivationByDate: {
            check: CardholderDeactivationByDateCheck
        },
        CardholderDeactivationByLimit: {
            check: CardholderDeactivationByLimitCheck
        },
        KeyStatus: {
            check: CardholderKeyStatusCheck
        }
    }

    // public static Notification = {
    //     NotificationEmail: NotificationEmailCheck,
    //     NotificationIMBot: NotificationIMBotCheck,
    //     NotificationPush: NotificationPushCheck,
    //     NotificationCardHolderCabinet: NotificationCardHolderCabinetCheck,
    //     NotificationGuestCabinet: NotificationGuestCabinetCheck
    // }

    public static Schedule: IFeatureModel = {
        ScheduleDailyWeeklySpecific: {
            check: ScheduleType
        },
        ScheduleFlexitime: {
            check: ScheduleType
        }
    }

    public static ReportsAndAttendance: IFeatureModel = {
        StandardReportSystem: {
            check: StandardReportSystemCheck,
            model: 'StandardReport',
            module: true
        }
    }

    public static Features: IFeatureModel = {
        // GuardTourFunction: {
        //     check: GuardTourFunctionCheck
        // },
        // ApartTimeZoneForEachDevice: {
        //     check: ApartTimeZoneForEachDeviceCheck
        // },
        // ApartDirectionControl: {
        //     check: ApartDirectionControlCheck
        // },
        OnlineMonitorDashboard: {
            check: OnlineMonitorDashboardCheck
        }
        // AlarmAcknowledgment: {
        //     check: AlarmAcknowlegmentCheck
        // }
    }

    public static AntiPassBack: IFeatureModel = {
        LocalAntiPassBack: {
            check: LocalAPB
        },
        HardAntiPassBack: {
            check: HardAPB
        },
        SoftAntiPassBack: {
            check: SoftAPB
        },
        TimedAntiPassBack: {
            check: TimedAPB
        },
        ZoneAntiPassBack: {
            check: ZoneAPB
        },
        ApartAntiPassBack: {
            check: ApartAPB
        }
    }

    public static ServiceFeatures: IFeatureModel = {
        TicketSystem: {
            check: TicketSystemCheck
        }
    }
}
// checking in acl
async function HaveAccess (ctx: DefaultContext, actionName: string, next: () => Promise<void>) {
    try {
        const access = await AccessControl.companyCanAccess(ctx.user.companyData.packet, actionName)
        if (access) {
            await next()
        } else {
            throw new Error('')
        }
    } catch (error) {
        ctx.status = 403
        ctx.body = { message: `This company dose not have ${actionName} feature` }
    }
}

async function CardholderGroupOperationCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'CardholderGroupOperation'
    if (ctx.user.super) {
        await next()
    } else {
        return await HaveAccess(ctx, actionName, next)
    }
}

async function CardholderGroupAccessRightCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'CardholderGroupAccessRight'
    const data = ctx.request.body
    if (ctx.user.super || !data.access_right) {
        await next()
    } else {
        return await HaveAccess(ctx, actionName, next)
    }
}
async function CardholderDeactivationByDateCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'CardholderDeactivationByDate'
    const data = ctx.request.body

    if (ctx.user.super || !data.limitations || !data.limitations.enable_date) {
        await next()
    } else {
        return await HaveAccess(ctx, actionName, next)
    }
}

async function CardholderDeactivationByLimitCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'CardholderDeactivationByLimit'
    const data = ctx.request.body

    if (ctx.user.super || !data.limitations || !(data.limitations.pass_counter_enable || data.limitations.first_use_counter_enable || data.limitations.last_use_counter_enable)) {
        await next()
    } else {
        return await HaveAccess(ctx, actionName, next)
    }
}

async function CardholderKeyStatusCheck (ctx: DefaultContext, next: () => Promise<void>) {
    await next()
}

async function ScheduleType (ctx: DefaultContext, next: () => Promise<void>) {
    let actionName = 'ScheduleType'
    if (ctx.request.body.type === 'flexitime') {
        actionName = 'ScheduleFlexitime'
    } else {
        actionName = 'ScheduleDailyWeeklySpecific'
    }
    return await HaveAccess(ctx, actionName, next)
}

async function LocalAPB (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'LocalAntiPassBack'
    return await HaveAccess(ctx, actionName, next)
}
async function HardAPB (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'HardAntiPassBack'
    return await HaveAccess(ctx, actionName, next)
}
async function SoftAPB (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'SoftAntiPassBack'
    return await HaveAccess(ctx, actionName, next)
}
async function TimedAPB (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'TimedAntiPassBack'
    return await HaveAccess(ctx, actionName, next)
}
async function ZoneAPB (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'ZoneAntiPassBack'
    return await HaveAccess(ctx, actionName, next)
}
async function ApartAPB (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'ApartAntiPassBack'
    return await HaveAccess(ctx, actionName, next)
}
async function StandardReportSystemCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'StandardReportSystem'
    return await HaveAccess(ctx, actionName, next)
}
// async function GuardTourFunctionCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     const actionName = 'ScheduleType'
//     return await HaveAccess(ctx, actionName, next)
// }
// async function ApartTimeZoneForEachDeviceCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     const actionName = 'ScheduleType'
//     return await HaveAccess(ctx, actionName, next)
// }
// async function ApartDirectionControlCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     const actionName = 'ScheduleType'
//     return await HaveAccess(ctx, actionName, next)
// }
async function OnlineMonitorDashboardCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'OnlineMonitorDashboard'
    return await HaveAccess(ctx, actionName, next)
}

// async function AlarmAcknowlegmentCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     const actionName = 'ScheduleType'
//     return await HaveAccess(ctx, actionName, next)
// }

// async function NotificationEmailCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     await next()
// }
// async function NotificationIMBotCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     await next()
// }
// async function NotificationPushCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     await next()
// }
// async function NotificationCarHolderCabinetCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     await next()
// }
// async function NotificationGuestCabinetCheck (ctx: DefaultContext, next: () => Promise<void>) {
//     await next()

async function TicketSystemCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'Ticket'
    return await HaveAccess(ctx, actionName, next)
}
export { Feature, ScheduleType }
