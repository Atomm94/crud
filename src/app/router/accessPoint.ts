import AccessPointController from '../controller/AccessPointController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .delete('AccessPoint-destroyItem', 'accessPoint', checkRole(), AccessPointController.destroy)
    .get('AccessPoint-getAllItems', 'accessPoint', checkRole(), AccessPointController.getAll)
    .delete('AccessPoint-destroyItem', 'accessPoint/reader', checkRole(), AccessPointController.readerDestroy)
    .put('Acu-updateItem', 'accessPoint/updateMode', checkRole(), AccessPointController.updateMode)
    .get('AccessPoint-getAllItems', 'accessPoint/resources/:type', checkRole(), AccessPointController.getAccessPointResources)
    .get('AccessPoint-getAllItems', 'accessPoint/types', checkRole(), AccessPointController.getAccessPointTypes)
    .get('Cardholder-addItem', 'accessPoint/cardholders', checkRole(), AccessPointController.getAllForCardholder)
    .get('AccessPoint-getAllItems', 'accessPoint/cameraSets', checkRole(), AccessPointController.getAccessPointsForCameraSet)
    .get('AccessPoint-getItem', 'accessPoint/:id', checkRole(), AccessPointController.get)
