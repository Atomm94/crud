import RoleController from '../controller/RoleController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // Role
  .post('Role-addItem', 'roles',
    checkRole(),
    resource(), RoleController.createRole)
  .get('Role-getItem', 'roles/:id',
    checkRole(),
    resource(), RoleController.getRoleById)
  .put('Role-updateItem', 'roles',
    checkRole(),
    resource(), RoleController.updateRole)
  .delete('Role-destroyItem', 'roles',
    checkRole(),
    resource(), RoleController.deleteRole)
  .get('Role-getAllItems', 'roles',
    checkRole(),
    resource(), RoleController.getRole)
  .get('Role-getAllItems', 'access',
    checkRole(),
    resource(), RoleController.getAllAccess)
