import AccessRightController from '../controller/AccessRightController'
import Router from 'koa-router'
import accessRule from './accessRule'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
// Timeframe controller CRUD endpoints
  .use('accessRight/', accessRule.routes(), accessRule.allowedMethods())

  // AccessRight controller CRUD endpoints
  .post('AccessRight-addItem', 'accessRight', checkRole(), resource(), AccessRightController.add)
  .put('AccessRight-updateItem', 'accessRight', checkRole(), AccessRightController.update)
  .delete('AccessRight-destroyItem', 'accessRight', checkRole(), AccessRightController.destroy)
  .get('AccessRight-getAllItems', 'accessRight', checkRole(), AccessRightController.getAll)
  .get('AccessRight-getAllItems', 'accessRight/relations/:id', checkRole(), AccessRightController.getRelations)
  .get('AccessRight-getItem', 'accessRight/:id', checkRole(), AccessRightController.get)
