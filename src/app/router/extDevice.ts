import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import ExtDeviceController from '../controller/ExtDeviceController'
const router = new Router()
export default router
    // ExtDevice controller CRUD endpoints
    .post('ExtDevice-addItem', 'extDevice', checkRole(), ExtDeviceController.add)
    .put('ExtDevice-updateItem', 'extDevice', checkRole(), ExtDeviceController.update)
    .get('ExtDevice-getItem', 'extDevice/:id', checkRole(), ExtDeviceController.get)
    .delete('ExtDevice-destroyItem', 'extDevice', checkRole(), ExtDeviceController.destroy)
    .get('ExtDevice-getAllItems', 'extDevice', checkRole(), ExtDeviceController.getAll)
