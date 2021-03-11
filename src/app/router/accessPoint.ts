import AccessPointController from '../controller/AccessPointController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .delete('AccessPoint-destroyItem', 'accessPoint', checkRole(), AccessPointController.destroy)
    .get('AccessPoint-getAllItems', 'accessPoint', checkRole(), AccessPointController.getAll)
    .delete('AccessPoint-destroyItem', '/reader', AccessPointController.readerDestroy)
    .get('AccessPoint-getAllItems', 'accessPoint/resources/:type', checkRole(), AccessPointController.getAccessPointResources)
    .get('AccessPoint-getAllItems', 'accessPoint/types', checkRole(), AccessPointController.getAccessPointTypes)
    .get('AccessPoint-getItem', 'accessPoint/:id', checkRole(), AccessPointController.get)
