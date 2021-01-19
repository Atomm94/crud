import AccessRuleController from '../controller/AccessRuleController'
import Router from 'koa-router'
const router = new Router()
export default router
    // AccessRule controller CRUD endpoints
    .post('AccessRight-addItem', 'accessRule', AccessRuleController.add)
    .put('AccessRight-updateItem', 'accessRule', AccessRuleController.update)
    .delete('AccessRight-destroyItem', 'accessRule', AccessRuleController.destroy)
    .get('AccessRight-getAllItems', 'accessRule', AccessRuleController.getAll)
    .get('AccessRight-getItem', 'accessRule/:id', AccessRuleController.get)
