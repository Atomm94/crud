import { logUserEvents } from '../enums/logUserEvents.enum'
import { getObjectDiff } from '../functions/checkDifference'
import MQTTBroker from './mqtt'
import { OperatorType } from './Operators'
import { SendTopics } from './Topics'

export default class SendUserLogMessage {
    readonly company: number
    readonly account: any
    readonly account_name: string
    readonly event: logUserEvents
    readonly target: string
    readonly value: any

    constructor (company: number, account: any, event: logUserEvents, target: string, value: any) {
        (async () => {
            let diff
            if (event === logUserEvents.CHANGE) {
                diff = await getObjectDiff(value.new, value.old)
                value = diff
            }
            if (event !== logUserEvents.CHANGE || (event === logUserEvents.CHANGE && diff && Object.keys(diff).length)) {
                const dataLog = {
                    operator: OperatorType.USER_LOG,
                    data: {
                        company: company,
                        account: account,
                        account_name: `${account.first_name} ${account.last_name}`,
                        event: event,
                        target: target,
                        value: value
                    }
                }
                MQTTBroker.publishMessage(SendTopics.LOG, JSON.stringify(dataLog))
            }
        })()
    }
}
