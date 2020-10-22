import * as winston from 'winston'
const log_level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'

const myformat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    // winston.format.align(),
    winston.format.simple(),
    // winston.format.cli({ colors: { info: 'green' } }),
    winston.format.printf((info: any) => `${info.timestamp} ${info.level}: ${info.message}`)
)
const logger = winston.createLogger({
    level: log_level,
    transports: [
        new winston.transports.Console({
            format: myformat
        })
    ]
})

export { logger }
