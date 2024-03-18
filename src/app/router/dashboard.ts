import DashboardController from '../controller/DashboardController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import { Feature } from '../middleware/feature'
import cacheRequest from '../middleware/cacheRequest'

const router = new Router()
export default router
    // Dashboard controller CRUD, endpoints
    .get('Dashboard-getAll', 'dashboard', checkRole(), Feature.Dashboard.OnlineMonitorDashboard.check, DashboardController.getAll)
    .get('Dashboard-getAllAccessPoints', 'dashboard/getAllAccessPoints', checkRole(), Feature.Dashboard.OnlineMonitorDashboard.check, DashboardController.getAllAccessPoints)
    .get('Dashboard-getAll', 'dashboard/getCardholders', checkRole(), Feature.Dashboard.OnlineMonitorDashboard.check, DashboardController.getCardholders)
    .get('Dashboard-getAll', 'dashboard/getDashboardActivity', checkRole(), cacheRequest(), Feature.Dashboard.OnlineMonitorDashboard.check, DashboardController.getDashboardActivity)
