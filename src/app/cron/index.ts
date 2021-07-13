
import * as Cron from 'cron'
import { Acu } from '../model/entity'
import { JwtToken } from '../model/entity/JwtToken'

import { acuStatus } from '../enums/acuStatus.enum'
// import { socketChannels } from '../enums/socketChannels.enum'
// import { SendDeviceMessage } from './mqtt/SendDeviceMessage.enum'
// import { OperatorType } from '../mqtt/Operators'
import DeviceController from '../controller/Hardware/DeviceController'

export default class CronJob {
    public static cronObj: any = {}
    public static active_devices: any = {}

    public static async startCrons () {
        this.deleteOldTokens('0 0 0 * * *')
        // this.devicePing('*/5 * * * * *')
    }

    public static deleteOldTokens (interval: string): void {
        this.cronObj[interval] = new Cron.CronJob(interval, async () => {
            const jwt_tokens: JwtToken[] = await JwtToken.find()
            const current_time = new Date().getTime()
            for (const jwt_token of jwt_tokens) {
                const expire_date = new Date(jwt_token.createDate).getTime() + 24 * 60 * 60 * 1000 // jwt_token.expire_time * 60 * 60 * 1000
                if (current_time > expire_date) {
                    JwtToken.delete(jwt_token.id)
                }
            }
        }).start()
    }

    public static async devicePing (interval: string) {
        const acus: any = await Acu.getAllItems({ where: { status: { '=': acuStatus.ACTIVE } }, relations: ['companies'] })
        for (const acu of acus) {
            this.active_devices[acu.id] = acu
        }

        new Cron.CronJob(interval, async () => {
            Object.keys(this.active_devices).forEach((acu_id: any) => {
                if (this.active_devices[acu_id].serial_number) {
                    const location = `${this.active_devices[acu_id].companies.account}/${this.active_devices[acu_id].company}`
                    // const topic = `${location}/registration/1073493824/Operate/`
                    DeviceController.ping(location, this.active_devices[acu_id].serial_number, 'none', this.active_devices[acu_id].session_id)
                }
            })
        }).start()
    }
}
