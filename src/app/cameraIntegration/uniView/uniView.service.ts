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

    public async getLiveStreamUrl (device_id: number, camera_id:number) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        const transType = config.cctv.transType
        const transProtocol = config.cctv.transProtocol
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number as string
        }
        const url = `${base_url}/LAPI/V1.0/Channels/${camera_id}/Media/Video/Streams/${0}/LiveStreamURL?TransType=${transType}&TransProtocol=${transProtocol}`

        const data: any = JSON.parse(await getRequestWIthDigestAuth(url, device))

        return data.Response.Data.URL
    }

    public async getPlaybackStreamCount (camera_id: any, device_id: any, begin:number, end:number) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number as string
        }
        const url = `${base_url}/LAPI/V1.0/Channels/${camera_id}/Media/Video/Streams/${0}/Records?Begin=${begin}&End=${end}`

        const playback_stream: any = await getRequestWIthDigestAuth(url, device)
        console.log('🚀 ~ file: uniView.service.ts:56 ~ UniView ~ getPlaybackStreamCount ~ playback_stream:', playback_stream)
        return JSON.parse(playback_stream).Response.Data.Nums
    }

    public async getPlaybackStreamUrl (camera_id: any, device_id: any, begin:number, end:number) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        let base_url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            base_url = `${device.domain}:${device.port}`
        } else if (device.connection_type === cameraDeviceConnType.CLOUD) {
            base_url = device.serial_number as string
        }
        const url = `${base_url}/LAPI/V1.0/Channels/${camera_id}/Media/Video/Streams/RecordURL?Begin=${begin}&End=${end}`
        const data: any = JSON.parse(await getRequestWIthDigestAuth(url, device))

        return data.Response.Data.URL
    }
}
