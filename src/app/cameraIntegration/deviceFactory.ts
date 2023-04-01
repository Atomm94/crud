import { cameraType } from './enums/deviceType.enum'
import { UniviewDeviceType } from './enums/univiewDeviceType'
import { UniView } from './uniView/uniView.service'

export class CameraIntegration {
    public async deviceFactory (device: any) {
        switch (device.type) {
            case cameraType.UNIVIEW:
                return await new UniView().connect(device)
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
