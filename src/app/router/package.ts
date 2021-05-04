import PackageController from '../controller/PackageController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // Package controller CRUD endpoints
    .post('Package-addItem', 'package', checkRole(), resource(), PackageController.add)
    .put('Package-updateItem', 'package', checkRole(), PackageController.update)
    .delete('Package-destroyItem', 'package', checkRole(), PackageController.destroy)
    .get('Package-Product-getAllItems', 'package', checkRole(), PackageController.getAll)
    .get('Package-getAllItems', 'packageExtraSettings', checkRole(), PackageController.getExtraSettings)
    .get('Package-Product-getItem', 'package/:id', checkRole(), PackageController.get)
