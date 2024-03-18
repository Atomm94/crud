import app from './app'
import { config } from '../config'
import { Database } from '../component/db'
import { Sendgrid } from '../component/sendgrid/sendgrid'
// import { logger } from '../../modules/winston/logger'
import { AccessControl } from './functions/access-control'
import { updateZohoConfig } from './functions/zoho-utils'
import MQTTBroker from '../app/mqtt/mqtt'
import { logger } from '../../modules/winston/logger'
import CronJob from './cron'
import { RedisClass } from '../component/redis'

const database = new Database();
// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests

(async () => {
    try {
        await database.connect()
        RedisClass.connect()
        await AccessControl.GrantAccess()
        await AccessControl.GrantCompanyAccess()
        await Sendgrid.init(config.sendgrid.apiKey)
        await MQTTBroker.init()
        await updateZohoConfig()
        CronJob.startCrons()
        app.listen(config.server.port, () => {
            logger.info(`APP listening at port ${config.server.port}`)
        }
        )

        process.on('SIGINT', async () => {
            try {
                await database.disconnect()
                process.exit(0)
            } catch (e) {
                process.exit(1)
            }
        })
    } catch (e) { console.error('Error:', e) }
})()
