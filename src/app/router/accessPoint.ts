import AccessPointController from '../controller/AccessPointController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .post('AccessPoint-addItem', 'accessPoint', checkRole(), resource(), AccessPointController.add)
    .put('AccessPoint-updateItem', 'accessPoint', checkRole(), AccessPointController.update)
    .delete('AccessPoint-destroyItem', 'accessPoint', checkRole(), AccessPointController.destroy)
    .get('AccessPoint-getAllItems', 'accessPoint', checkRole(), AccessPointController.getAll)
    .get('AccessPoint-getItem', 'accessPoint/:id', checkRole(), AccessPointController.get)
