import AccessRuleController from '../controller/AccessRuleController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessRule controller CRUD endpoints
    .post('AccessRight-addItem', 'accessRule', checkRole(), resource(), AccessRuleController.add)
    .put('AccessRight-updateItem', 'accessRule', checkRole(), resource(), AccessRuleController.update)
    .delete('AccessRight-destroyItem', 'accessRule', checkRole(), resource(), AccessRuleController.destroy)
    .get('AccessRight-getAllItems', 'accessRule', checkRole(), resource(), AccessRuleController.getAll)
    .get('AccessRight-getItem', 'accessRule/:id', checkRole(), resource(), AccessRuleController.get)
