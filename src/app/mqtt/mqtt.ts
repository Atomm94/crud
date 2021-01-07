import { connect } from 'mqtt'
import { logger } from '../../../modules/winston/logger'
import config from '../../config'
import { TopicCodes } from './Topics'

export default class MQTTBroker {
    public static client: any = null
    public static async init () {
        this.client = connect(config.mqtt)
        return await new Promise((resolve, reject) => {
            this.client.on('connect', (status: any) => {
                logger.info('MQTT server connected successfully!')
                this.subscribeAll()
                resolve(status)
            })
            this.client.on('error', (err: any) => {
                if (err) {
                    logger.error('', err)
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject('MQTT connection timed out!')
                }
            })
        })
    }

    public static publishMessage (topic: string, msg: string): void {
        this.client.publish(topic, msg, (error: any) => {
            if (error) logger.error('publish error', error)
        })
    }

    public static subscribe (topic: string | number) {
        this.client.subscribe(topic, (err: any) => {
            if (err) logger.error('subscribe error', err)
        })
    }

    public static getMessage (callback: Function) {
        this.client.on('message', function (topic: string, message: string) {
            if (topic && message) {
                return callback(topic, message.toString())
            }
        })
    }

    private static subscribeAll () {
        const topicList = Object.values(TopicCodes)
        for (let i = 0; i < topicList.length; i++) {
            const topic = topicList[i]
            this.client.subscribe(topic, (err: any) => {
                if (err) {
                    logger.error('topic subscription error', err)
                } else {
                    logger.info(`Topic "${topic}" subscription success`)
                }
            })
        }
    }
}
