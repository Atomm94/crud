import { CameraDevice } from '../model/entity/CameraDevice'
import { cameraApiCodes } from './enums/cameraApiCodes.enum'
import { cameraType } from './enums/deviceType.enum'
import { UniviewDeviceType } from './enums/univiewDeviceType'
import { UniView } from './uniView/uniView.service'

export class CameraIntegration {
    public async deviceFactory (device: CameraDevice, api_code: cameraApiCodes, access_point?: number) {
        switch (device.camera_type) {
            case cameraType.UNIVIEW:
                switch (api_code) {
                    case cameraApiCodes.TEST:
                        return await new UniView().connect(device)
                    case cameraApiCodes.CAMERASLIST:
                        return await new UniView().getCameras(device)
                    case cameraApiCodes.LIVESTREAM:
                        return await new UniView().getLiveStreamUrl(device.id)
                    case cameraApiCodes.PLAYBACKSTREAM:
                        return await new UniView().getPlaybackStreamUrl(access_point, device)
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
