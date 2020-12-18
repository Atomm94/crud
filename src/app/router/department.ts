import DepartmentController from '../controller/DepartmentController'
import Router from 'koa-router'
const router = new Router()
export default router
  // Department controller CRUD endpoints
  .post('Department-addItem', 'department', DepartmentController.add)
  .put('Department-updateItem', 'department', DepartmentController.update)
  .delete('Department-destroyItem', 'department', DepartmentController.destroy)
  .get('Department-getAllItems', 'department', DepartmentController.getAll)
  .get('Department-getItem', 'department/:id', DepartmentController.get)
