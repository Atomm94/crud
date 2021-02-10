import AccessPointGroupController from '../controller/AccessPointGroupController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessPointGroup controller CRUD endpoints
    .post('AccessPointGroup-addItem', 'accessPointGroup', checkRole(), AccessPointGroupController.add)
    .put('AccessPointGroup-updateItem', 'accessPointGroup', checkRole(), AccessPointGroupController.update)
    .get('AccessPointGroup-destroyItem', 'accessPointGroup/:id', checkRole(), AccessPointGroupController.get)
    .delete('AccessPointGroup-getAllItems', 'accessPointGroup', checkRole(), AccessPointGroupController.destroy)
    .get('AccessPointGroup-getItem', 'accessPointGroup', checkRole(), AccessPointGroupController.getAll)
