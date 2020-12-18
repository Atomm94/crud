import TimeframeController from '../controller/TimeframeController'
import Router from 'koa-router'

const router = new Router()

export default router
  // Timeframe controller CRUD endpoints
  .post('Schedule-addItem', 'timeframe', TimeframeController.add)
  .put('Schedule-updateItem', 'timeframe', TimeframeController.update)
  .delete('Schedule-destroyItem', 'timeframe', TimeframeController.destroy)
  .get('Schedule-getAllItems', 'timeframe', TimeframeController.getAll)
  .put('Schedule-updateItem', 'timeframe/clone', TimeframeController.clone)
  .get('Schedule-getItem', 'timeframe/:id', TimeframeController.get)
