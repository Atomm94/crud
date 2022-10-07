import StandardReportController from '../controller/StandardReportController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'

import { StandardReportSystemCheck } from '../middleware/feature'
const router = new Router()
export default router
    // standardReport controller CRUD endpoints
    .delete('standardReport-destroyItem', 'standardReport', checkRole(), StandardReportController.destroy)
    .get('standardReport-getAllItems', 'standardReport', checkRole(), StandardReportController.getAll)
    .post('standardReport-addItem', 'standardReport', checkRole(), StandardReportSystemCheck, StandardReportController.add)
    .put('standardReport-updateItem', 'standardReport', checkRole(), StandardReportSystemCheck, StandardReportController.update)
    .get('standardReport-getAllItems', 'standardReport/execute', checkRole(), StandardReportController.execute)
    .get('standardReport-getAllItems', 'standardReport/eventList', checkRole(), StandardReportController.getEventList)
    .get('standardReport-getItem', 'standardReport/:id', checkRole(), StandardReportController.get)
