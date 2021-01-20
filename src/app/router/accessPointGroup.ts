import AccessPointGroupController from '../controller/AccessPointGroupController'
import Router from 'koa-router'
const router = new Router()
export default router
    // AccessPointGroup controller CRUD endpoints
    .post('accessPointGroup', AccessPointGroupController.add)
    .put('accessPointGroup', AccessPointGroupController.update)
    .get('accessPointGroup/:id', AccessPointGroupController.get)
    .delete('accessPointGroup', AccessPointGroupController.destroy)
    .get('accessPointGroup', AccessPointGroupController.getAll)
