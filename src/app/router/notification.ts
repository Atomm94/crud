import NotificationController from '../controller/NotificationController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Notification controller CRUD endpoints
  .put('Dashboard-getAll', 'notification/confirm', checkRole(), NotificationController.confirm)
  .get('Dashboard-getAll', 'notification', checkRole(), NotificationController.getAll)
  .get('Dashboard-getAll', 'notification/:id', checkRole(), NotificationController.get)
