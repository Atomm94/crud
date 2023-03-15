import { deviceType } from './enums/deviceType.enum'
import { UniviewDeviceConnectionType } from './enums/univiewDeviceConnectionType'
import { UniView } from './uniView/uniView.service'

export class CameraIntegration {
    public async deviceFactory (device: any) {
        switch (device.device_type) {
            case deviceType.UNIVIEW:
                return new UniView().connect(device)
        }
    }

    public async deviceConnectionFactory (connection_type: UniviewDeviceConnectionType) {
        switch (connection_type) {
            case UniviewDeviceConnectionType.NVR:
                return 'NVR'
            case UniviewDeviceConnectionType.IPC:
                return 'IPC'
        }
    }
}
