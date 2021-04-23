import DashboardController from '../controller/DashboardController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import { Feature } from '../middleware/feature'
const router = new Router()
export default router
    // Dashboard controller CRUD endpoints
    .get('Dashboard-getAllItems', 'dashboard', checkRole(), Feature.Features.OnlineMonitorDashboard.check, DashboardController.getAll)
    .get('Dashboard-getAllItems', 'dashboard/getAllAccessPoints', Feature.Features.OnlineMonitorDashboard.check, checkRole(), DashboardController.getAllAccessPoints)
