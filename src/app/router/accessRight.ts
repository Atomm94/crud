import AccessRightController from '../controller/AccessRightController'
import Router from 'koa-router'
import accessRule from './accessRule'
const router = new Router()
export default router
// Timeframe controller CRUD endpoints
  .use('/', accessRule.routes(), accessRule.allowedMethods())

  // AccessRight controller CRUD endpoints
  .post('AccessRight-addItem', 'accessRight', AccessRightController.add)
  .put('AccessRight-updateItem', 'accessRight', AccessRightController.update)
  .delete('AccessRight-destroyItem', 'accessRight', AccessRightController.destroy)
  .get('AccessRight-getAllItems', 'accessRight', AccessRightController.getAll)
  .get('AccessRight-getItem', 'accessRight/:id', AccessRightController.get)
