import StandardReportController from '../controller/StandardReportController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // standardReport controller CRUD endpoints
    .delete('standardReport-destroyItem', 'standardReport', checkRole(), StandardReportController.destroy)
    .get('standardReport-getAllItems', 'standardReport', checkRole(), StandardReportController.getAll)
    .post('standardReport-addItem', 'standardReport', checkRole(), StandardReportController.add)
    .put('standardReport-updateItem', 'standardReport', checkRole(), StandardReportController.update)
    .get('standardReport-getAllItems', 'standardReport/execute', checkRole(), StandardReportController.execute)
    .get('standardReport-getItem', 'standardReport/:id', checkRole(), StandardReportController.get)
