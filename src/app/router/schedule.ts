import ScheduleController from '../controller/ScheduleController'
import Router from 'koa-router'
import timeframe from './timeframe'
const router = new Router()
export default router
// Timeframe controller CRUD endpoints
  .use('/timeframe', timeframe.routes(), timeframe.allowedMethods())

  .post('Schedule-addItem', '/', ScheduleController.add)
  .put('Schedule-updateItem', '/', ScheduleController.update)
  .delete('Schedule-destroyItem', '/', ScheduleController.destroy)
  .get('Schedule-getAllItems', '/', ScheduleController.getAll)
  .get('Schedule-getAllItems', '/tree', ScheduleController.getTree)
  .get('Schedule-getAllItems', '/relations/:id', ScheduleController.getRelations)

  .use('/timeframe', timeframe.routes(), timeframe.allowedMethods())
  .get('Schedule-getItem', '/:id', ScheduleController.get)
