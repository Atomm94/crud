import AccountGroupController from '../controller/AccountGroupController'
import Router from 'koa-router'
const router = new Router()
export default router

    // AccountGroup controller CRUD endpoints
    .post('AccountGroup-addItem', 'accountGroup', AccountGroupController.add)
    .put('AccountGroup-updateItem', 'accountGroup', AccountGroupController.update)
    .delete('AccountGroup-destroyItem', 'accountGroup', AccountGroupController.destroy)
    .get('AccountGroup-getAllItems', 'accountGroup', AccountGroupController.getAll)
    .get('AccountGroup-getItem', 'accountGroup/:id', AccountGroupController.get)
    .get('AccountGroup-getGroupAccountsCounts', 'accountGroupAccounts/:id', AccountGroupController.getGroupAccountsCounts)
