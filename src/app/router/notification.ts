import NotificationController from '../controller/NotificationController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Notification controller CRUD endpoints
  .put('Notification-updateItem', 'notification/confirm', checkRole(), NotificationController.confirm)
  .get('Notification-getAllItems', 'notification', checkRole(), NotificationController.getAll)
  .get('Notification-getItem', 'notification/:id', checkRole(), NotificationController.get)
