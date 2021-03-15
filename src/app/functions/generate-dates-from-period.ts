import { standartReportPeriod } from '../enums/standartReportPeriod.enum'

export function generateDatesFromPeriod (period: { key: standartReportPeriod, value: any }, start_time?: string, end_time?: string) {
    start_time = start_time || '00:00:00'
    end_time = end_time || '23:59:59'
    let new_date = new Date()
    let start_date, end_date, week
    switch (period.key) {
        case standartReportPeriod.CURRENT_DAY:
            start_date = end_date = new Date()
            break
        case standartReportPeriod.CURRENT_WEEK:
            week = getWeekStartEndDates()
            start_date = week.start_date
            end_date = week.end_date
            break
        case standartReportPeriod.CURRENT_MONTH:
            start_date = new Date(new_date.getFullYear(), new_date.getMonth(), 1)
            end_date = new Date(new_date.getFullYear(), new_date.getMonth(), 0)
            break
        case standartReportPeriod.PREVIOUS_DAY:
            start_date = end_date = new Date(new Date().getTime() - 60 * 60 * 24 * 1000)
            break
        case standartReportPeriod.PREVIOUS_WEEK:
            week = getWeekStartEndDates(1)
            start_date = week.start_date
            end_date = week.end_date
            break
        case standartReportPeriod.PREVIOUS_MONTH:
            start_date = new Date(new_date.getFullYear(), new_date.getMonth() - 1, 1)
            end_date = new Date(new_date.getFullYear(), new_date.getMonth() - 1, 0)
            break
        case standartReportPeriod.TARGET_DAY:
            start_date = end_date = new Date(period.value)
            break
        case standartReportPeriod.TARGET_MONTH:
            new_date = new Date(period.value)
            start_date = new Date(new_date.getFullYear(), new_date.getMonth(), 1)
            end_date = new Date(new_date.getFullYear(), new_date.getMonth(), 0)
            break
        case standartReportPeriod.TARGET_PERIOD:
            start_date = period.value.start_date
            end_date = period.value.end_date
            break
    }

    return {
        start_from: `${start_date.getFullYear()}-${start_date.getMonth() + 1}-${start_date.getDate()} ${start_time}`,
        start_to: `${end_date.getFullYear()}-${end_date.getMonth() + 1}-${end_date.getDate()} ${end_time}`
    }
}

function getWeekStartEndDates (previous_week_count: number = 0): { start_date: Date, end_date: Date } {
    const beforeOneWeek = new Date(new Date().getTime() - previous_week_count * 60 * 60 * 24 * 7 * 1000)
    const beforeOneWeek2 = new Date(beforeOneWeek)
    const day = beforeOneWeek.getDay()
    const diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
    const lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
    const lastSunday = new Date(beforeOneWeek2.setDate(diffToMonday + 6))
    return { start_date: lastMonday, end_date: lastSunday }
}
