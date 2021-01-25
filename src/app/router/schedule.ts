import ScheduleController from '../controller/ScheduleController'
import Router from 'koa-router'
import timeframe from './timeframe'
import { ScheduleType } from '../middleware/feature'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // Timeframe controller CRUD endpoints
  .use('schedule/', timeframe.routes(), timeframe.allowedMethods())

  .post('Schedule-addItem', 'schedule',
    checkRole(), resource(),
    ScheduleType,
    ScheduleController.add
  )
  .put('Schedule-updateItem', 'schedule',
    checkRole(), resource(),
    ScheduleType,
    ScheduleController.update
  )
  .delete('Schedule-destroyItem', 'schedule', checkRole(), resource(), ScheduleController.destroy)
  .get('Schedule-getAllItems', 'schedule', checkRole(), resource(), ScheduleController.getAll)
  .get('Schedule-getAllItems', 'schedule/tree', checkRole(), resource(), ScheduleController.getTree)
  .get('Schedule-getItem', 'schedule/:id', checkRole(), resource(), ScheduleController.get)
