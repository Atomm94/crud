import AccessPointZoneController from '../controller/AccessPointZoneController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessPointZone controller CRUD endpoints
    .post('AccessPointZone-addItem', 'accessPointZone', checkRole(), AccessPointZoneController.add)
    .put('AccessPointZone-updateItem', 'accessPointZone', checkRole(), AccessPointZoneController.update)
    .get('AccessPointZone-destroyItem', 'accessPointZone/:id', checkRole(), AccessPointZoneController.get)
    .delete('AccessPointZone-getAllItems', 'accessPointZone', checkRole(), AccessPointZoneController.destroy)
    .get('AccessPointZone-getItem', 'accessPointZone', checkRole(), AccessPointZoneController.getAll)
