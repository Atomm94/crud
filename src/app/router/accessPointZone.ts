import AccessPointZoneController from '../controller/AccessPointZoneController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPointZone controller CRUD endpoints
    .post('AccessPointZone-addItem', 'accessPointZone', checkRole(), resource(), AccessPointZoneController.add)
    .put('AccessPointZone-updateItem', 'accessPointZone', checkRole(), resource(), AccessPointZoneController.update)
    .get('AccessPointZone-destroyItem', 'accessPointZone/:id', checkRole(), resource(), AccessPointZoneController.get)
    .delete('AccessPointZone-getAllItems', 'accessPointZone', checkRole(), resource(), AccessPointZoneController.destroy)
    .get('AccessPointZone-getItem', 'accessPointZone', checkRole(), resource(), AccessPointZoneController.getAll)
