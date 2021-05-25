import AccessPointGroupController from '../controller/AccessPointGroupController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessPointGroup controller CRUD endpoints
    .post('AccessPoint-addItem', 'accessPointGroup', checkRole(), AccessPointGroupController.add)
    .put('AccessPoint-updateItem', 'accessPointGroup', checkRole(), AccessPointGroupController.update)
    .get('AccessPoint-destroyItem', 'accessPointGroup/:id', checkRole(), AccessPointGroupController.get)
    .delete('AccessPoint-getAllItems', 'accessPointGroup', checkRole(), AccessPointGroupController.destroy)
    .get('AccessPoint-getItem', 'accessPointGroup', checkRole(), AccessPointGroupController.getAll)
