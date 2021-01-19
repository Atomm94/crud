import RoleController from '../controller/RoleController'
import Router from 'koa-router'
const router = new Router()
export default router
  // Role
  .post('Role-addItem', 'roles', RoleController.createRole)
  .get('Role-getItem', 'roles/:id', RoleController.getRoleById)
  .put('Role-updateItem', 'roles', RoleController.updateRole)
  .delete('Role-destroyItem', 'roles', RoleController.deleteRole)
  .get('Role-getAllItems', 'roles', RoleController.getRole)
  .get('Role-getAllItems', 'access', RoleController.getAllAccess)
