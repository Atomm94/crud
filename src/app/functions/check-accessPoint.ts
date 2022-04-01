
import { canCreate } from '../middleware/resource'
import { resourceKeys } from '../enums/resourceKeys.enum'
import { AccessPoint } from '../model/entity'
import { accessPointType } from '../enums/accessPointType.enum'

export class CheckAccessPoint {
    public static async checkResourcesLimit (access_points: AccessPoint[] | null, company: number) {
        if (access_points) {
            const resourcesAccessPoints: any = {
                AccessPoint: { qty: 0 },
                [resourceKeys.ELEVATOR]: { qty: 0 },
                [resourceKeys.TURNSTILE]: { qty: 0 }
            }
            for (const access_point of access_points) {
                if (!access_point.id) {
                    let resource_name = 'AccessPoint'
                    if (access_point.type === accessPointType.FLOOR) {
                        resource_name = resourceKeys.ELEVATOR
                    } else if ([accessPointType.TURNSTILE_ONE_SIDE, accessPointType.TURNSTILE_TWO_SIDE].includes(access_point.type)) {
                        resource_name = resourceKeys.TURNSTILE
                    }
                    resourcesAccessPoints[resource_name].qty++
                }
            }

            for (const resource_name of Object.keys(resourcesAccessPoints)) {
                if (resourcesAccessPoints[resource_name].qty) {
                    const canCreateResource: boolean = await canCreate(company, resource_name, resourcesAccessPoints[resource_name].qty)
                    if (!canCreateResource) {
                        return `${resource_name} resource limit has been reached`
                    }
                }
            }
        }
        return true
    }
}
