import AccessRuleController from '../controller/AccessRuleController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // AccessRule controller CRUD endpoints
    .post('AccessRight-addItem', 'accessRule', checkRole(), AccessRuleController.add)
    .put('AccessRight-updateItem', 'accessRule', checkRole(), AccessRuleController.update)
    .delete('AccessRight-destroyItem', 'accessRule', checkRole(), AccessRuleController.destroy)
    .get('AccessRight-getAllItems', 'accessRule', checkRole(), AccessRuleController.getAll)
    .get('AccessRight-getItem', 'accessRule/:id', checkRole(), AccessRuleController.get)
