import PackageTypeController from '../controller/PackageTypeController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // PackageType controller CRUD endpoints
  .post('PackageType-addItem', 'packageType', checkRole(), PackageTypeController.add)
  .put('PackageType-updateItem', 'packageType', checkRole(), PackageTypeController.update)
  .delete('PackageType-destroyItem', 'packageType', checkRole(), PackageTypeController.destroy)
  .get('PackageType-getAllItems', 'packageType', checkRole(), PackageTypeController.getAll)
  .get('PackageType-getItem', 'packageType/:id', checkRole(), PackageTypeController.get)
