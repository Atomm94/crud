import cluster from 'cluster'
//  import os from 'os'
import app from './app'
import { config } from '../config'
import { Database } from '../component/db'
import { Sendgrid } from '../component/sendgrid/sendgrid'
import { AccessControl } from './functions/access-control'
import { updateZohoConfig } from './functions/zoho-utils'
import MQTTBroker from '../app/mqtt/mqtt'
import { logger } from '../../modules/winston/logger'
import CronJob from './cron'
import { RedisClass } from '../component/redis'
import uuid from 'uuid'
const fs = require('fs')
const database = new Database()

let mqtt_group_id: any

// Function to generate or retrieve UUID
function getUUID () {
    if (!mqtt_group_id) {
        // Try to read UUID from file
        try {
            mqtt_group_id = fs.readFileSync('uuid.txt', 'utf8')
        } catch (err) {
            // If file doesn't exist or cannot be read, generate a new UUID
            mqtt_group_id = uuid.v4()
            // Store UUID in a file
            fs.writeFileSync('uuid.txt', mqtt_group_id, 'utf8')
        }
    }
    return mqtt_group_id
}

if (cluster.isMaster) {
    // const numCPUs = +config.cluster.qty > 0 ? +config.cluster.qty : os.cpus().length
    const numCPUs = 1
    // Generate new UUID in a file
    fs.writeFileSync('uuid.txt', uuid.v4(), 'utf8')
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }
    (async () => {
        try {
            await database.connect(true)
            RedisClass.connect()
            CronJob.startCrons()
            await MQTTBroker.init(getUUID(), false)
            await AccessControl.GrantAccess()
            await AccessControl.GrantCompanyAccess()
            await Sendgrid.init(config.sendgrid.apiKey)
            await updateZohoConfig()
            app.listen(config.server.port, () => {
                logger.info(`APP listening at port ${config.server.port}`)
            })
        } catch (e) {
            console.error('Error:', e)
        }
    })()

    cluster.on('exit', (worker, code, signal) => {
        logger.error(`Worker ${worker.process.pid} died`)
        try {
            database.disconnect()
            process.exit(0)
        } catch (e) {
            process.exit(1)
        }
    })
} else {
    // Workers share the TCP connection in this server
    // create connection with database
    // note that its not active database connection
    // TypeORM creates you connection pull to uses connections from pull on your requests
    (async () => {
        try {
            await database.connect()
            RedisClass.connect()
            await MQTTBroker.init(getUUID())
            process.on('SIGINT', async () => {
                try {
                    await database.disconnect()
                    process.exit(0)
                } catch (e) {
                    process.exit(1)
                }
            })
        } catch (e) {
            console.error('Error:', e)
        }
    })()
}
