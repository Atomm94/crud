import { CameraDevice } from '../model/entity/CameraDevice'
import { cameraApiCodes } from './enums/cameraApiCodes.enum'
import { cameraType } from './enums/deviceType.enum'
import { UniviewDeviceType } from './enums/univiewDeviceType'
import { UniView } from './uniView/uniView.service'

export class CameraIntegration {
    public async deviceFactory (device: CameraDevice, api_code: cameraApiCodes, camera_id?: number, begin?: number, end?: number) {
        switch (device.camera_type) {
            case cameraType.UNIVIEW:
                switch (api_code) {
                    case cameraApiCodes.TEST:
                        return await new UniView().connect(device)
                    case cameraApiCodes.CAMERASLIST:
                        return await new UniView().getCameras(device)
                    case cameraApiCodes.LIVESTREAM:
                        return await new UniView().getLiveStreamUrl(device.id, camera_id as number)
                    case cameraApiCodes.PLAYBACKSTREAM:
                        return await new UniView().getPlaybackStreamUrl(camera_id, device.id, begin as number, end as number)
                    case cameraApiCodes.PLAYBACKSTREAMCOUNT:
                        return await new UniView().getPlaybackStreamCount(camera_id, device.id, begin as number, end as number)
                    default:
                        break
                }
        }
    }

    public async deviceTypeFactory (device_type: UniviewDeviceType) {
        switch (device_type) {
            case UniviewDeviceType.NVR:
                return 'nvr'
            case UniviewDeviceType.IPC:
                return 'ipc'
        }
    }
}
