import { cameraDeviceConnType } from '../../enums/camerDevice.enum'
import { CameraDevice } from '../../model/entity/CameraDevice'
import { getRequest } from '../requestUtil'

export class UniView {
    public async connect (device: any) {
        let url = device.url
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            url = `${device.domain}/${device.port}/LAPI/V1.0/ISAPI/Security/userCheck`
        }

        return new Promise((resolve, reject) => {
            getRequest(url)
                .then((res: string) => {
                    console.log('res', res)
                    return {
                        success: true
                    }
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

    public async getCameras (device: any) {
        let url = device.url
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            url = `${device.domain}/${device.port}/LAPI/V1.0/Channels/System/ChannelDetailInfos`
        }

        return new Promise((resolve, reject) => {
            getRequest(url)
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

    public async getLiveStreamUrl (device: any, camera: any) {
        let url = device.url
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            url = `${device.domain}/${device.port}/LAPI/V1.0/Channels/${1}/Media/Video/Streams/${0}/LiveStreamURL?TransType=0&TransProtocol=1`
        }

        return new Promise((resolve, reject) => {
            getRequest(url)
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

    public async getPlaybackStreamUrl (device_id: any) {
        const device = await CameraDevice.getItem(device_id) as CameraDevice
        let url = ''
        if (device.connection_type === cameraDeviceConnType.IP_DOMAIN) {
            url = `${device.domain}/${device.port}/LAPI/V1.0/Channels/${1}/Media/Video/Streams/${0}/Records?Begin=${5}&End=${15}`
        }

        return new Promise((resolve, reject) => {
            getRequest(url)
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
