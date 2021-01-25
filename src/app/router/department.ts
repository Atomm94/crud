import DepartmentController from '../controller/DepartmentController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // Department controller CRUD endpoints
  .post('Department-addItem', 'department', checkRole(), resource(), DepartmentController.add)
  .put('Department-updateItem', 'department', checkRole(), resource(), DepartmentController.update)
  .delete('Department-destroyItem', 'department', checkRole(), resource(), DepartmentController.destroy)
  .get('Department-getAllItems', 'department', checkRole(), resource(), DepartmentController.getAll)
  .get('Department-getItem', 'department/:id', checkRole(), resource(), DepartmentController.get)
