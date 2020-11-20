import app from './app'
import config from '../config'
import { Database } from '../component/db'
import { Sendgrid } from '../component/sendgrid/sendgrid'
import { logger } from '../../modules/winston/logger'
import { AccessControl } from './functions/access-control'

const database = new Database();
// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
(async () => {
    try {
        await database.connect()
        await AccessControl.GrantAccess()
        await AccessControl.GrantCompanyAccess()
        await Sendgrid.init(config.sendgrid.apiKey)
        app.listen(
            config.server.port, () => console.log('APP listening at port %d', config.server.port)
        )

        process.on('SIGINT', async () => {
            try {
                await database.disconnect()
                process.exit(0)
            } catch (e) {
                process.exit(1)
            }
        })
    } catch (e) { logger.error('Error:', e) }
})()
