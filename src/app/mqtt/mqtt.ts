import { connect } from 'mqtt'
import { logger } from '../../../modules/winston/logger'
import config from '../../config'

export default class MQTTBroker {
    static client: any = null
    static async init () {
        this.client = connect(config.mqtt)
        return await new Promise((resolve, reject) => {
            this.client.on('connect', (status: any) => {
                logger.info('MQTT server connected successfully!')
                resolve(status)
            })
            this.client.on('error', (err: any) => {
                console.log(err)
                if (err) {
                    logger.error('', err)
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject('MQTT connection timed out!')
                }
            })
        })
    }

    static publishMessage (msg: string, topic: string): void {
        this.client.publish(topic, msg)
    }

    static subscribe (topic:string) {
        this.client.subscribe(topic, (err: any) => {
            if (err) console.log('subscribe error', err)
        })
    }

    static getMessage (callback: Function) {
        this.client.on('message', function (topic: string, message: string) {
            if (topic && message) {
                return callback(topic, message)
            }
        })
    }
}
