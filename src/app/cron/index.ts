
import * as Cron from 'cron'
import { AccessPoint, Acu, Cardholder } from '../model/entity'
import { JwtToken } from '../model/entity/JwtToken'

import { acuStatus } from '../enums/acuStatus.enum'
// import { socketChannels } from '../enums/socketChannels.enum'
// import { SendDeviceMessage } from './mqtt/SendDeviceMessage.enum'
// import { OperatorType } from '../mqtt/Operators'
import DeviceController from '../controller/Hardware/DeviceController'
import { AcuStatus } from '../model/entity/AcuStatus'
import { acuCloudStatus } from '../enums/acuCloudStatus.enum'
import { AccessPointStatus } from '../model/entity/AccessPointStatus'
import { postBodyRequestForToken } from '../services/requestUtil'
import fs from 'fs'
import { acuConnectionMode } from '../enums/acuConnectionMode.enum'
import { guestKeyType } from '../enums/guestKeyType.enum'
import { guestPeriod } from '../enums/guestPeriod.enum'
import moment from 'moment'
import { CameraDevice } from '../model/entity/CameraDevice'
import { CameraIntegration } from '../cameraIntegration/deviceFactory'
import { cameraApiCodes } from '../cameraIntegration/enums/cameraApiCodes.enum'
import { Camera } from '../model/entity/Camera'

const acu_cloud_status_change_time = process.env.ACU_CLOUD_STATUS_CHANGE_TIME ? Number(process.env.ACU_CLOUD_STATUS_CHANGE_TIME) : 1 // in minutes
const delete_old_tokens_interval = process.env.DELETE_OLD_TOKENS_INTERVAL ? process.env.DELETE_OLD_TOKENS_INTERVAL : '0 0 0 * * *'
// const device_ping_interval = process.env.DEVICE_PING_INTERVAL ? process.env.DEVICE_PING_INTERVAL : '*/15 * * * * *'
const update_acucloud_status_interval = process.env.UPDATE_ACUCLOUD_STATUS_INTERVAL ? process.env.UPDATE_ACUCLOUD_STATUS_INTERVAL : '0 */10 * * * *'
const update_accesspoint_door_state_interval = process.env.UPDATE_ACCESSPOINT_DOOR_STATE_INTERVAL ? process.env.UPDATE_ACCESSPOINT_DOOR_STATE_INTERVAL : '0 */10 * * * *'
const send_set_heart_bit_interval = process.env.SEND_SET_HEART_BIT_INTERVAL ? process.env.SEND_SET_HEART_BIT_INTERVAL : '0 0 0 * * *'
const update_camera_device_cameras_interval = process.env.UPDATE_CAMERA_DEVICE_CAMERAS_INTERVAL ? process.env.UPDATE_CAMERA_DEVICE_CAMERAS_INTERVAL : '*/15 * * * * *' // '0 */10 * * * *'

export default class CronJob {
    public static cronObj: any = {}
    public static active_devices: any = {}
    public static guests: any = {}

    public static async startCrons () {
        this.deleteOldTokens(delete_old_tokens_interval)
        // this.devicePing('*/15 * * * * *')
        this.updateAcuCloudStatus(update_acucloud_status_interval)
        this.updateAccessPointDoorState(update_accesspoint_door_state_interval)
        this.sendSetHeartBit(send_set_heart_bit_interval)
        // this.testZoho('0 0 * * * *')
        this.initGuestKeys()
        this.updateCameraDeviceCameras(update_camera_device_cameras_interval)
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
            const acu_statuses: any = await AcuStatus.getAllItems({ relations: ['acus'] })
            for (const acu_status of acu_statuses) {
                var acu = acu_status.acus
                let cloud_status = acuCloudStatus.OFFLINE
                if (acu_status.timestamp > (new Date().getTime() - acu_cloud_status_change_time * 60 * 1000)) {
                    cloud_status = acuCloudStatus.ONLINE
                }
                acu.cloud_status = cloud_status
                acu.fw_version = acu_status.fw_version
                acu.rev = acu_status.rev
                acu.api_ver = acu_status.api_ver
                acu.acu_comment = acu_status.acu_comment

                let network: any = {}
                if (acu.network) {
                    network = JSON.parse(acu.network)
                }
                network.connection_type = acu_status.connection_type
                network.ip_address = acu_status.ip_address
                network.gateway = acu_status.gateway
                network.subnet_mask = acu_status.subnet_mask
                network.dns_server = acu_status.dns_server
                network.fixed = acu_status.connection_mod === acuConnectionMode.FIXED
                network.dhcp = !network.fixed
                network.ssid = acu_status.ssid
                acu.network = JSON.stringify(network)

                Acu.save(acu)
            }
        }).start()
    }

    public static async updateAccessPointDoorState (interval: string) {
        new Cron.CronJob(interval, async () => {
            const access_point_statuses: any = await AccessPointStatus.getAllItems({ relations: ['access_points'] })
            for (const access_point_status of access_point_statuses) {
                if (access_point_status.access_points.door_state !== access_point_status.door_state) {
                    access_point_status.access_points.door_state = access_point_status.door_state
                    AccessPoint.save(access_point_status.access_points)
                }
            }
        }).start()
    }

    public static async sendSetHeartBit (interval: string) {
        new Cron.CronJob(interval, async () => {
            const acus: any = await Acu.getAllItems({ where: { status: acuStatus.ACTIVE, heart_bit: false }, relation: ['companies'] })
            for (const acu of acus) {
                const location = `${acu.companies.account}/${acu.company}`
                const set_heart_bit_data = {
                    On: true,
                    min: 1
                }
                DeviceController.setHeartBit(location, acu.serial_number, set_heart_bit_data, acu.session_id)
            }
        }).start()
    }

    public static async testZoho (interval: string) {
        new Cron.CronJob(interval, async () => {
            const tokenBody = {
                refresh_token: '1000.99547e7704523e647cba11d91983c084.24fca9e20858c398d9236442276807b2',
                client_id: '1000.G60JL3Z8NMVLGV730OLU4MTVKL0JWF',
                client_secret: '66e15bbc878b690911941d139525724685abd1ab1b',
                redirect_uri: 'https://api.unimacs.studio-one.am/zoho/code',
                grant_type: 'refresh_token'
            }

            const linkForToken = 'https://accounts.zoho.com/oauth/v2/token'

            let token: any = await postBodyRequestForToken(linkForToken, tokenBody)
            token = JSON.parse(token)
            let old_reses = fs.readFileSync(`${__dirname}/responses.txt`, 'utf-8')
            old_reses = `${old_reses}\n${new Date()} - ${JSON.stringify(token)}`
            fs.writeFileSync(`${__dirname}/responses.txt`, old_reses)
        }).start()
    }

    public static async initGuestKeys () {
        const guests = await Cardholder.find({ where: { guest: true, key_type: guestKeyType.TEMPORARY } })
        for (const guest of guests) {
            this.setGuestKeySchedule(guest)
        }
    }

    public static async setGuestKeySchedule (guest: any) {
        if (guest.key_type === guestKeyType.TEMPORARY) {
            let remove_date
            if (guest.period === guestPeriod.DAYS) {
                const end_date = `${moment(guest.end_date).format('YYYY-MM-DD')} ${guest.end_time}`
                remove_date = new Date(end_date)
            } else if (guest.period === guestPeriod.HOURS) {
                const start_date = `${moment(guest.start_date).format('YYYY-MM-DD')} ${guest.start_time}`
                const duration_time = guest.duration * 60 * 1000
                const end_date_timestamp = new Date(start_date).getTime() + duration_time
                remove_date = new Date(end_date_timestamp)
            }
            if (remove_date) {
                if (remove_date <= new Date()) {
                    const where = { id: guest.id, company: guest.company }
                    Cardholder.destroyItem(where)
                } else {
                    if (this.guests[guest.id]) {
                        this.guests[guest.id].stop()
                    }
                    this.guests[guest.id] = new Cron.CronJob(remove_date, async () => {
                        const where = { id: guest.id, company: guest.company }
                        Cardholder.destroyItem(where)
                    })
                    this.guests[guest.id].start()
                }
            }
        }
    }

    public static async unSetGuestKeySchedule (guest: any) {
        if (guest.key_type === guestKeyType.TEMPORARY) {
            if (this.guests[guest.id]) {
                this.guests[guest.id].stop()
                delete this.guests[guest.id]
            }
        }
    }

    public static async updateCameraDeviceCameras (interval: any) {
        new Cron.CronJob(interval, async () => {
            const camera_devices = await CameraDevice.createQueryBuilder('camera_device')
                .leftJoinAndSelect('camera_device.cameras', 'camera', 'camera.delete_date is null')
                .getMany()
            for (const camera_device of camera_devices) {
                const obj_cameras: any = {}
                camera_device.cameras.map(camera => { obj_cameras[camera.service_id] = camera })
                try {
                    const cameraList = await new CameraIntegration().deviceFactory(camera_device, cameraApiCodes.CAMERASLIST)
                    const data = cameraList.Response.Data.DetailInfos
                    for (const _camera of data) {
                        const save_data: any = {
                            service_id: _camera.ID as number,
                            service_name: _camera.Name,
                            channel_type: _camera.ChannelType,
                            status: _camera.Status,
                            stream_nums: _camera.StreamNums,
                            device_type: _camera.DeviceType,
                            allow_distribution: _camera.AllowDistribution,
                            add_type: _camera.AddType,
                            access_protocol: _camera.AccessProtocol,
                            off_reason: _camera.OffReason,
                            remote_index: _camera.RemoteIndex,
                            manufacturer: _camera.Manufacturer,
                            device_model: _camera.DeviceModel,
                            gbid: _camera.GBID,
                            address_info: _camera.AddressInfo,
                            is_poe_port: _camera.IsPoEPort,
                            poe_status: _camera.PoEStatus,
                            camera_device: camera_device.id,
                            company: camera_device.company
                        }
                        if (!obj_cameras[_camera.ID]) {
                            await Camera.addItem(save_data as Camera)
                        } else {
                            save_data.id = obj_cameras[_camera.ID].id
                            await Camera.updateItem(save_data as Camera)
                            delete obj_cameras[_camera.ID]
                        }
                    }
                    for (const camera_service_id in obj_cameras) {
                        await Camera.destroyItem(obj_cameras[camera_service_id])
                    }
                } catch (error) {
                    console.log('error updateCameraDeviceCameras device', JSON.stringify(camera_device), error)
                }
            }
        }).start()
    }
}
