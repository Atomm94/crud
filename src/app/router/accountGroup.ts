import AccountGroupController from '../controller/AccountGroupController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router

    // AccountGroup controller CRUD endpoints
    .post('AccountGroup-addItem', 'accountGroup', checkRole(), resource(), AccountGroupController.add)
    .put('AccountGroup-updateItem', 'accountGroup', checkRole(), AccountGroupController.update)
    .delete('AccountGroup-destroyItem', 'accountGroup', checkRole(), AccountGroupController.destroy)
    .get('AccountGroup-getAllItems', 'accountGroup', checkRole(), AccountGroupController.getAll)
    .get('AccountGroup-getGroupAccountsCounts', 'accountGroup/relations/:id', checkRole(), AccountGroupController.getGroupAccountsCounts)
    .get('AccountGroup-getItem', 'accountGroup/:id', checkRole(), AccountGroupController.get)
