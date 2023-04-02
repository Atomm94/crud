import { cameraDeviceConnType } from '../enums/camerDevice.enum'
import { CameraDevice } from '../../model/entity/CameraDevice'
import { getRequestWIthDigestAuth } from '../requestUtil'
import { config } from '../../../config'
export class UniView {
    public async connect (device: any) {
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number
        }
        const url = `${base_url}/LAPI/V1.0/System/Time`
        return await getRequestWIthDigestAuth(url, device)
    }

    public async getCameras (device: any) {
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number
        }
        const url = `${base_url}/LAPI/V1.0/Channels/System/ChannelDetailInfos`

        return new Promise((resolve, reject) => {
            getRequestWIthDigestAuth(url, device)
                .then((res: string) => {
                    console.log('res', res)
                    resolve(res)
                    // resolve(res)
                })
                .catch(rej => {
                    let reject_data
                    try {
                        reject_data = JSON.parse(rej)
                        console.log(reject_data)
                    } catch (error) {
                    }
                })
        })
    }

    public async getLiveStreamUrl (device_id: any) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        const transType = config.cctv.transType
        const transProtocol = config.cctv.transProtocol
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number as string
        }
        const url = `${base_url}/LAPI/V1.0/Channels/${1}/Media/Video/Streams/${0}/LiveStreamURL?TransType=${transType}&TransProtocol=${transProtocol}`

        return new Promise((resolve, reject) => {
            getRequestWIthDigestAuth(url, device)
                .then((res: any) => {
                    console.log('res', res)
                    resolve(res.url)

                    // resolve(res)
                })
                .catch(rej => {
                    let reject_data
                    try {
                        reject_data = JSON.parse(rej)
                        console.log(reject_data)
                    } catch (error) {
                    }
                })
        })
    }

    public async getPlaybackStreamUrl (access_point: any, device_id:any) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number as string
        }
        const url = `${base_url}/LAPI/V1.0/Channels/${1}/Media/Video/Streams/${0}/Records?Begin=${5}&End=${15}`

        return new Promise((resolve, reject) => {
            getRequestWIthDigestAuth(url, device)
                .then((res: any) => {
                    console.log('res', res)
                    resolve(res.url)

                    // resolve(res)
                })
                .catch(rej => {
                    let reject_data
                    try {
                        reject_data = JSON.parse(rej)
                        console.log(reject_data)
                    } catch (error) {
                    }
                })
        })
    }
}
