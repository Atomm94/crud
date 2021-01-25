import TicketController from '../controller/TicketController'
import Router from 'koa-router'
import ticketMessage from './ticketMessage'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // Ticket controller CRUD endpoints
  .use('ticket/', ticketMessage.routes(), ticketMessage.allowedMethods())

  .post('Ticket-addItem', 'ticket', checkRole(), resource(), TicketController.add)
  .put('Ticket-updateItem', 'ticket', checkRole(), resource(), TicketController.update)
  .delete('Ticket-destroyItem', 'ticket', checkRole(), resource(), TicketController.destroy)
  .get('Ticket-getAllItems', 'ticket', checkRole(), resource(), TicketController.getAll)
  .post('Ticket-saveImage', 'ticket/file', checkRole(), resource(), TicketController.saveImage)
  .delete('Ticket-deleteImage', 'ticket/file', checkRole(), resource(), TicketController.deleteImage)
  .get('Ticket-getItem', 'ticket/:id', checkRole(), resource(), TicketController.get)
