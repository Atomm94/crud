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
    checkRole(),
    ScheduleController.update
  )
  .delete('Schedule-destroyItem', 'schedule', checkRole(), ScheduleController.destroy)
  .get('Schedule-getAllItems', 'schedule', checkRole(), ScheduleController.getAll)
  .get('Schedule-getAllItems', 'schedule/tree', checkRole(), ScheduleController.getTree)
  .get('Schedule-getAllItems', 'schedule/relations/:id', checkRole(), ScheduleController.getRelations)
  .get('Schedule-getItem', 'schedule/:id', checkRole(), ScheduleController.get)
