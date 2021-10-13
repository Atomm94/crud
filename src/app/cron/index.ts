
import * as Cron from 'cron'
import { AccessPoint, Acu } from '../model/entity'
import { JwtToken } from '../model/entity/JwtToken'

import { acuStatus } from '../enums/acuStatus.enum'
// import { socketChannels } from '../enums/socketChannels.enum'
// import { SendDeviceMessage } from './mqtt/SendDeviceMessage.enum'
// import { OperatorType } from '../mqtt/Operators'
import DeviceController from '../controller/Hardware/DeviceController'
import { AcuStatus } from '../model/entity/AcuStatus'
import { acuCloudStatus } from '../enums/acuCloudStatus.enum'
import { AccessPointStatus } from '../model/entity/AccessPointStatus'
const acu_cloud_status_change_time = process.env.ACU_CLOUD_STATUS_CHANGE_TIME ? Number(process.env.ACU_CLOUD_STATUS_CHANGE_TIME) : 1 // in minutes

export default class CronJob {
    public static cronObj: any = {}
    public static active_devices: any = {}

    public static async startCrons () {
        this.deleteOldTokens('0 0 0 * * *')
        this.devicePing('*/15 * * * * *')
        this.updateAcuCloudStatus('0 */10 * * * *')
        this.updateAccessPointDoorState('0 */10 * * * *')
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

    public static async updateAcuCloudStatus (interval: string) {
        new Cron.CronJob(interval, async () => {
            const acu_statuses: any = await AcuStatus.getAllItems({ relations: ['acus', 'companies'] })
            for (const acu_status of acu_statuses) {
                if (acu_status.timestamp > (new Date().getTime() - acu_cloud_status_change_time * 60 * 1000)) { // hard code!!
                    acu_status.acus.cloud_status = acuCloudStatus.ONLINE
                } else {
                    acu_status.acus.cloud_status = acuCloudStatus.OFFLINE
                }
                Acu.save(acu_status.acus)
            }
        }).start()
    }

    public static async updateAccessPointDoorState (interval: string) {
        new Cron.CronJob(interval, async () => {
            const access_point_statuses: any = await AccessPointStatus.getAllItems({ relations: ['access_points', 'companies'] })
            for (const access_point_status of access_point_statuses) {
                access_point_status.access_points.door_state = access_point_status.door_state
                AccessPoint.save(access_point_status.access_points)
            }
        }).start()
    }
}
