import AccessPointZoneController from '../controller/AccessPointZoneController'
import Router from 'koa-router'
const router = new Router()
export default router
    // AccessPointZone controller CRUD endpoints
    .post('accessPointZone', AccessPointZoneController.add)
    .put('accessPointZone', AccessPointZoneController.update)
    .get('accessPointZone/:id', AccessPointZoneController.get)
    .delete('accessPointZone', AccessPointZoneController.destroy)
    .get('accessPointZone', AccessPointZoneController.getAll)
