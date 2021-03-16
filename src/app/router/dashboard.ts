import DashboardController from '../controller/DashboardController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
    // Dashboard controller CRUD endpoints
    .get('Dashboard-getAllItems', 'dashboard', checkRole(), DashboardController.getAll)
    .get('Dashboard-getAllItems', 'dashboard/getAllAccessPoints', checkRole(), DashboardController.getAllAccessPoints)
