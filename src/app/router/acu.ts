import AcuController from '../controller/AcuController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .post('Acu-addItem', 'acu', checkRole(), resource(), AcuController.add)
    .put('Acu-updateItem', 'acu', checkRole(), AcuController.update)
    .delete('Acu-destroyItem', 'acu', checkRole(), AcuController.destroy)
    .get('Acu-getAllItems', 'acu', checkRole(), AcuController.getAll)
    .get('Acu-getAllItems', 'acu/models', checkRole(), AcuController.getAcuModels)
    .get('Acu-getItem', 'acu/:id', checkRole(), AcuController.get)
