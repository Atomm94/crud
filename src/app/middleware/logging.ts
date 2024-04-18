import { config } from '../../config'
import * as winston from 'winston'
import { getLogLevelForStatus } from '../../lib/logger'
import { DefaultContext } from 'koa'
import { logger } from '../../../modules/winston/logger'

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
    const start = +new Date()
    const date = new Date().toISOString()
    let req_data: string = `${ctx.method} ${ctx.originalUrl} reqBody - ${ctx.method === 'GET' ? ctx.query ? JSON.stringify(ctx.query) : '{}' : ctx.request.body ? JSON.stringify(ctx.request.body) : '{}'}`
    if (ctx.user) req_data += `, user - ${ctx.user.id} `
    logger.info(req_data)
    const previous_value = process.cpuUsage()

    await next()

    const ms = +new Date() - start
    const usage = process.cpuUsage(previous_value)
    const cpuUsage = `User: ${usage.user} System: ${usage.system}`
    const msg: string = `${date} ${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms cpuUsage:${cpuUsage}`
    winston.configure({
        level: 'debug',
        transports: [
            //
            // - Write to all logs with specified level to console.
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ]
    })

    if (config.nodeEnv !== 'production') { winston.log(getLogLevelForStatus(ctx.status, 'winston'), msg) }
}
