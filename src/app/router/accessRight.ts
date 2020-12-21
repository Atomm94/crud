import AccessRightController from '../controller/AccessRightController'
import Router from 'koa-router'
const router = new Router()
export default router
  // Timeframe controller CRUD endpoints
  .post('AccessRight-addItem', 'accessRight', AccessRightController.add)
  .put('AccessRight-updateItem', 'accessRight', AccessRightController.update)
  .get('AccessRight-getItem', 'accessRight/:id', AccessRightController.get)
  .delete('AccessRight-destroyItem', 'accessRight', AccessRightController.destroy)
  .get('AccessRight-getAllItems', 'accessRight', AccessRightController.getAll)

  .get('AccessRight-getAllItems', '/relations/:id', AccessRightController.getRelations)
