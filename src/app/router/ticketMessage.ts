import TicketController from '../controller/TicketController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Ticket message controller CRUD endpoints

  .post('Ticket-addMessage', 'message', checkRole(), TicketController.addTicketMessage)
  .put('Ticket-updateMessage', 'message', checkRole(), TicketController.updateTicketMessage)
  .delete('Ticket-destroyMessage', 'message', checkRole(), TicketController.destroyTicketMessage)
  .get('Ticket-getAllMessages', 'message', checkRole(), TicketController.getAllTicketMessages)
  .post('Ticket-saveImage', 'message/file', checkRole(), TicketController.ticketMessageImageSave)
  .delete('Ticket-deleteImage', 'message/file', checkRole(), TicketController.ticketMessageImageDelete)
  .get('Ticket-getMessage', 'message/:id', checkRole(), TicketController.getTicketMessage)
