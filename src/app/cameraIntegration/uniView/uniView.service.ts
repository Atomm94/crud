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
        return JSON.parse(await getRequestWIthDigestAuth(url, device))
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

        const data: any = JSON.parse(await getRequestWIthDigestAuth(url, device))

        return data.Response.Data.URL
    }

    public async getPlaybackStreamUrl (access_point: any, device_id: any) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number as string
        }
        const url = `${base_url}/LAPI/V1.0/Channels/${1}/Media/Video/Streams/${0}/Records?Begin=${5}&End=${15}`

        return await getRequestWIthDigestAuth(url, device)
    }
}
