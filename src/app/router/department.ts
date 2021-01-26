import DepartmentController from '../controller/DepartmentController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Department controller CRUD endpoints
  .post('Department-addItem', 'department', checkRole(), DepartmentController.add)
  .put('Department-updateItem', 'department', checkRole(), DepartmentController.update)
  .delete('Department-destroyItem', 'department', checkRole(), DepartmentController.destroy)
  .get('Department-getAllItems', 'department', checkRole(), DepartmentController.getAll)
  .get('Department-getItem', 'department/:id', checkRole(), DepartmentController.get)
