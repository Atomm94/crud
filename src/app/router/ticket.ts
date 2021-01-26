import TicketController from '../controller/TicketController'
import Router from 'koa-router'
import ticketMessage from './ticketMessage'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Ticket controller CRUD endpoints
  .use('ticket/', ticketMessage.routes(), ticketMessage.allowedMethods())

  .post('Ticket-addItem', 'ticket', checkRole(), TicketController.add)
  .put('Ticket-updateItem', 'ticket', checkRole(), TicketController.update)
  .delete('Ticket-destroyItem', 'ticket', checkRole(), TicketController.destroy)
  .get('Ticket-getAllItems', 'ticket', checkRole(), TicketController.getAll)
  .post('Ticket-saveImage', 'ticket/file', checkRole(), TicketController.saveImage)
  .delete('Ticket-deleteImage', 'ticket/file', checkRole(), TicketController.deleteImage)
  .get('Ticket-getItem', 'ticket/:id', checkRole(), TicketController.get)
