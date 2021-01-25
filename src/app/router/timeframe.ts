import TimeframeController from '../controller/TimeframeController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'

const router = new Router()

export default router
  // Timeframe controller CRUD endpoints
  .post('Schedule-addItem', 'timeframe', checkRole(), resource(), TimeframeController.add)
  .put('Schedule-updateItem', 'timeframe', checkRole(), resource(), TimeframeController.update)
  .delete('Schedule-destroyItem', 'timeframe', checkRole(), resource(), TimeframeController.destroy)
  .get('Schedule-getAllItems', 'timeframe', checkRole(), resource(), TimeframeController.getAll)
  .put('Schedule-updateItem', 'timeframe/clone', checkRole(), resource(), TimeframeController.clone)
  .get('Schedule-getItem', 'timeframe/:id', checkRole(), resource(), TimeframeController.get)
