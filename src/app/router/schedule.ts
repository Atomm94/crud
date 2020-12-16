import ScheduleController from '../controller/ScheduleController'
import Router from 'koa-router'
import timeframe from './timeframe'
const router = new Router()
export default router
  // Timeframe controller CRUD endpoints
  .post('Schedule-addItem', '/', ScheduleController.add)
  .put('Schedule-updateItem', '/', ScheduleController.update)
  .get('Schedule-getItem', '/:id', ScheduleController.get)
  .delete('Schedule-destroyItem', '/', ScheduleController.destroy)
  .get('Schedule-getAllItems', '/', ScheduleController.getAll)
  .get('Schedule-getAllItems', '/tree', ScheduleController.getTree)
  .use('/timeframe', timeframe.routes(), timeframe.allowedMethods())
