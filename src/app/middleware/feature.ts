import { DefaultContext } from 'koa'
import { AccessControl } from '../functions/access-control'
interface IFeature {
    check: (ctx: DefaultContext, next: () => Promise<void>)=>void,
    model?: string,
    module?: boolean
}
interface IFeatureModel {
    [featureName: string]: IFeature
}
class Feature {
    public static Cardholder: IFeatureModel = {
        CardholderGroupOperation: {
            check: CardHolderGroupOperationCheck,
            model: 'CardholderGroup',
            module: true
        },
        CardholderGroupAccessRight: {
            check: CardHolderGroupAccessRightCheck,
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

    public static AntiPassBack: IFeatureModel = {
        LocalAntiPassBack: {
            check: APB
        },
        HardAntiPassBack: {
            check: APB
        },
        SoftAntiPassBack: {
            check: APB
        },
        TimedAntiPassBack: {
            check: APB
        },
        ZoneAntiPassBack: {
            check: APB
        },
        ApartAntiPassBack: {
            check: APB
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

async function CardHolderGroupOperationCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'CardHolderOperation'
    if (ctx.user.super) {
        await next()
    } else {
        return await HaveAccess(ctx, actionName, next)
    }
}

async function CardHolderGroupAccessRightCheck (ctx: DefaultContext, next: () => Promise<void>) {
    const actionName = 'CardHolderGroupAccessRight'
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

async function APB (ctx: DefaultContext, next: () => Promise<void>) {
    await next()
}

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
export { Feature, APB, ScheduleType }
