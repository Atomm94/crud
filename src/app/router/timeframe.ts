import TimeframeController from '../controller/TimeframeController'
import Router from 'koa-router'

const router = new Router()

export default router
  // Timeframe controller CRUD endpoints
  .post('Schedule-addItem', '/', TimeframeController.add)
  .put('Schedule-updateItem', '/', TimeframeController.update)
  .delete('Schedule-destroyItem', '/', TimeframeController.destroy)
  .get('Schedule-getAllItems', '/', TimeframeController.getAll)
  .put('Schedule-updateItem', '/clone', TimeframeController.clone)
  .get('Schedule-getItem', '/:id', TimeframeController.get)
