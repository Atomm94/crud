import AutoTaskScheduleController from '../controller/AutoTaskScheduleController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // autoTaskSchedule controller CRUD endpoints
    .post('autoTaskSchedule-addItem', 'autoTaskSchedule', checkRole(), AutoTaskScheduleController.add)
    .put('autoTaskSchedule-updateItem', 'autoTaskSchedule', checkRole(), AutoTaskScheduleController.update)
    .delete('autoTaskSchedule-destroyItem', 'autoTaskSchedule', checkRole(), AutoTaskScheduleController.destroy)
    .get('autoTaskSchedule-getAllItems', 'autoTaskSchedule', checkRole(), AutoTaskScheduleController.getAll)
    .get('autoTaskSchedule-getAllItems', 'autoTaskSchedule/commands', checkRole(), AutoTaskScheduleController.getCommandsList)
    .get('autoTaskSchedule-getItem', 'autoTaskSchedule/:id', checkRole(), AutoTaskScheduleController.get)
