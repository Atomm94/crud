import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import ExtDeviceController from '../controller/ExtDeviceController'
const router = new Router()
export default router
    // ExtDevice controller CRUD endpoints
    .post('extDevice', checkRole(), ExtDeviceController.add)
    .put('extDevice', checkRole(), ExtDeviceController.update)
    .get('extDevice/:id', checkRole(), ExtDeviceController.get)
    .delete('extDevice', checkRole(), ExtDeviceController.destroy)
    .get('extDevice', checkRole(), ExtDeviceController.getAll)
