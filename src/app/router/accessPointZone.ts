import AccessPointZoneController from '../controller/AccessPointZoneController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessPointZone controller CRUD endpoints
    .post('AccessPoint-addItem', 'accessPointZone', checkRole(), AccessPointZoneController.add)
    .put('AccessPoint-updateItem', 'accessPointZone', checkRole(), AccessPointZoneController.update)
    .get('AccessPoint-destroyItem', 'accessPointZone/:id', checkRole(), AccessPointZoneController.get)
    .delete('AccessPoint-getAllItems', 'accessPointZone', checkRole(), AccessPointZoneController.destroy)
    .get('AccessPoint-getItem', 'accessPointZone', checkRole(), AccessPointZoneController.getAll)
