import RoleController from '../controller/RoleController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import checkGetRoleById from '../middleware/checkGetRoleById'

const router = new Router()
export default router
  // Role
  .post('Role-addItem', 'roles', checkRole(), RoleController.createRole)
  .get('Role-getItem', 'roles/:id', checkGetRoleById(), checkRole(), RoleController.getRoleById)
  .put('Role-updateItem', 'roles', checkRole(), RoleController.updateRole)
  .delete('Role-destroyItem', 'roles', checkRole(), RoleController.deleteRole)
  .get('Role-getAllItems', 'roles', checkRole(), RoleController.getRole)
  .get('Role-getAllItems', 'access', checkRole(), RoleController.getAllAccess)
