import AccessPointController from '../controller/AccessPointController'
import Router from 'koa-router'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .post('accessPoint', AccessPointController.add)
    .put('accessPoint', AccessPointController.update)
    .delete('accessPoint', AccessPointController.destroy)
    .get('accessPoint', AccessPointController.getAll)
    .get('accessPoint/:id', AccessPointController.get)
