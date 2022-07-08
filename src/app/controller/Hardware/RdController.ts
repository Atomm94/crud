import { AccessPoint, AccessPointZone, AntipassBack } from '../../model/entity'
import { OperatorType } from '../../mqtt/Operators'
import SendDeviceMessage from '../../mqtt/SendDeviceMessage'

export default class RdController {
    public static async setRd (location: string, serial_number: number, readers: any, access_point_zones: AccessPointZone | -1, user: any, session_id: string | null = '') {
        if (readers.length) {
            const send_data = {
                access_point: readers[0].access_point,
                access_point_type: readers[0].access_point_type,
                readers: readers,
                access_point_zones
            }
            new SendDeviceMessage(OperatorType.SET_RD, location, serial_number, send_data, user, session_id)
        }
    }

    public static async setRdForFloor (location: string, serial_number: number, reader: any, access_points: AccessPoint[] | Array<{ id: number }> | any, user: any, session_id: string | null = '') {
        if (reader) {
            for (const access_point of access_points) {
                if ('access_point_zone' in access_point && access_point.access_point_zone) {
                    if ('access_point_zones' in access_point) {
                        if (access_point.access_point_zones && !access_point.access_point_zones.antipass_backs) {
                            access_point.access_point_zones.antipass_backs = await AntipassBack.findOne({ where: { id: access_point.access_point_zones.antipass_back } })
                        }
                    } else {
                        access_point.access_point_zones = await AccessPointZone.findOne({ where: { id: access_point.access_point_zone }, relations: ['antipass_backs'] })
                    }
                }
            }
            const send_data = {
                access_points: access_points,
                reader: reader,
                elevator_mode: true
            }
            new SendDeviceMessage(OperatorType.SET_RD, location, serial_number, send_data, user, session_id)
        }
    }

    public static async delRd (location: string, serial_number: number, data: any, user: any, session_id: string | null = '0') {
        new SendDeviceMessage(OperatorType.DEL_RD, location, serial_number, data, user, session_id)
    }
}
