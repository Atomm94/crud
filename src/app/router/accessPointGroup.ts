import AccessPointGroupController from '../controller/AccessPointGroupController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPointGroup controller CRUD endpoints
    .post('AccessPointGroup-addItem', 'accessPointGroup', checkRole(), resource(), AccessPointGroupController.add)
    .put('AccessPointGroup-updateItem', 'accessPointGroup', checkRole(), resource(), AccessPointGroupController.update)
    .get('AccessPointGroup-destroyItem', 'accessPointGroup/:id', checkRole(), resource(), AccessPointGroupController.get)
    .delete('AccessPointGroup-getAllItems', 'accessPointGroup', checkRole(), resource(), AccessPointGroupController.destroy)
    .get('AccessPointGroup-getItem', 'accessPointGroup', checkRole(), resource(), AccessPointGroupController.getAll)
