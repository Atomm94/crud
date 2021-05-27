import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import ExtDeviceController from '../controller/ExtDeviceController'
const router = new Router()
export default router
    // ExtDevice controller CRUD endpoints
    .post('Acu-addItem', 'extDevice', checkRole(), ExtDeviceController.add)
    .put('Acu-updateItem', 'extDevice', checkRole(), ExtDeviceController.update)
    .get('Acu-getItem', 'extDevice/:id', checkRole(), ExtDeviceController.get)
    .delete('Acu-destroyItem', 'extDevice', checkRole(), ExtDeviceController.destroy)
    .get('Acu-getAllItems', 'extDevice', checkRole(), ExtDeviceController.getAll)
