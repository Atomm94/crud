import AccountGroupController from '../controller/AccountGroupController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router

    // AccountGroup controller CRUD endpoints
    .post('AccountGroup-addItem', 'accountGroup', checkRole(), resource(), AccountGroupController.add)
    .put('AccountGroup-updateItem', 'accountGroup', checkRole(), resource(), AccountGroupController.update)
    .delete('AccountGroup-destroyItem', 'accountGroup', checkRole(), resource(), AccountGroupController.destroy)
    .get('AccountGroup-getAllItems', 'accountGroup', checkRole(), resource(), AccountGroupController.getAll)
    .get('AccountGroup-getGroupAccountsCounts', 'accountGroup/relations/:id', checkRole(), resource(), AccountGroupController.getGroupAccountsCounts)
    .get('AccountGroup-getItem', 'accountGroup/:id', checkRole(), resource(), AccountGroupController.get)
