import AccessPointController from '../controller/AccessPointController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .post('AccessPoint-addItem', 'accessPoint', checkRole(), resource(), AccessPointController.add)
    .put('AccessPoint-updateItem', 'accessPoint', checkRole(), resource(), AccessPointController.update)
    .delete('AccessPoint-destroyItem', 'accessPoint', checkRole(), resource(), AccessPointController.destroy)
    .get('AccessPoint-getAllItems', 'accessPoint', checkRole(), resource(), AccessPointController.getAll)
    .get('AccessPoint-getItem', 'accessPoint/:id', checkRole(), resource(), AccessPointController.get)
