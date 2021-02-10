import TimeframeController from '../controller/TimeframeController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'

const router = new Router()

export default router
  // Timeframe controller CRUD endpoints
  .post('Schedule-addItem', 'timeframe', checkRole(), TimeframeController.add)
  .put('Schedule-updateItem', 'timeframe', checkRole(), TimeframeController.update)
  .delete('Schedule-destroyItem', 'timeframe', checkRole(), TimeframeController.destroy)
  .get('Schedule-getAllItems', 'timeframe', checkRole(), TimeframeController.getAll)
  .put('Schedule-updateItem', 'timeframe/clone', checkRole(), TimeframeController.clone)
  .get('Schedule-getItem', 'timeframe/:id', checkRole(), TimeframeController.get)
