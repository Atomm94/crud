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
  .put('AccessRight-updateItem', 'accessRight', checkRole(), resource(), AccessRightController.update)
  .delete('AccessRight-destroyItem', 'accessRight', checkRole(), resource(), AccessRightController.destroy)
  .get('AccessRight-getAllItems', 'accessRight', checkRole(), resource(), AccessRightController.getAll)
  .get('AccessRight-getAllItems', 'accessRight/relations/:id', checkRole(), resource(), AccessRightController.getRelations)
  .get('AccessRight-getItem', 'accessRight/:id', checkRole(), resource(), AccessRightController.get)
