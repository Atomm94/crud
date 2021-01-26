import TicketController from '../controller/TicketController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Ticket message controller CRUD endpoints

  .post('Ticket-addMessage', 'message', checkRole(), TicketController.addTicketMessage)
  .put('Ticket-updateMessage', 'message', checkRole(), TicketController.updateTicketMessage)
  .get('Ticket-getMessage', 'message/:id', checkRole(), TicketController.getTicketMessage)
  .delete('Ticket-destroyMessage', 'message', checkRole(), TicketController.destroyTicketMessage)
  .get('Ticket-getAllMessages', 'message', checkRole(), TicketController.getAllTicketMessages)
