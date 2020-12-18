import ScheduleController from '../controller/ScheduleController'
import Router from 'koa-router'
import timeframe from './timeframe'
const router = new Router()
export default router
// Timeframe controller CRUD endpoints
  .use('/', timeframe.routes(), timeframe.allowedMethods())

  .post('Schedule-addItem', 'schedule', ScheduleController.add)
  .put('Schedule-updateItem', 'schedule', ScheduleController.update)
  .delete('Schedule-destroyItem', 'schedule', ScheduleController.destroy)
  .get('Schedule-getAllItems', 'schedule', ScheduleController.getAll)
  .get('Schedule-getAllItems', 'schedule/tree', ScheduleController.getTree)
  .get('Schedule-getItem', 'schedule/:id', ScheduleController.get)
