import TicketController from '../controller/TicketController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // Ticket message controller CRUD endpoints

  .post('Ticket-addMessage', 'message', checkRole(), resource(), TicketController.addTicketMessage)
  .put('Ticket-updateMessage', 'message', checkRole(), resource(), TicketController.updateTicketMessage)
  .get('Ticket-getMessage', 'message/:id', checkRole(), resource(), TicketController.getTicketMessage)
  .delete('Ticket-destroyMessage', 'message', checkRole(), resource(), TicketController.destroyTicketMessage)
  .get('Ticket-getAllMessages', 'message', checkRole(), resource(), TicketController.getAllTicketMessages)
