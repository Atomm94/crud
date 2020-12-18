import TicketController from '../controller/TicketController'
import Router from 'koa-router'
const router = new Router()
export default router
  // Ticket controller CRUD endpoints
  .post('Ticket-addItem', 'ticket', TicketController.add)
  .put('Ticket-updateItem', 'ticket', TicketController.update)
  .get('Ticket-getItem', 'ticket/:id', TicketController.get)
  .delete('Ticket-destroyItem', 'ticket', TicketController.destroy)
  .get('Ticket-getAllItems', 'ticket', TicketController.getAll)
  .post('Ticket-saveImage', 'ticketImage', TicketController.saveImage)
  .delete('Ticket-deleteImage', 'ticketImage', TicketController.deleteImage)

  .post('Ticket-addMessage', 'addTicketMessage', TicketController.addTicketMessage)
  .put('Ticket-updateMessage', 'updateTicketMessage', TicketController.updateTicketMessage)
  .get('Ticket-getMessage', 'getTicketMessage/:id', TicketController.getTicketMessage)
  .delete('Ticket-destroyMessage', 'destroyTicketMessage', TicketController.destroyTicketMessage)
  .get('Ticket-getAllMessages', 'getAllTicketMessages', TicketController.getAllTicketMessages)

  .post('Ticket-saveMessageImage', 'ticketMessageImage', TicketController.ticketMessageImageSave)
  .delete('Ticket-deleteMessageImage', 'ticketMessageImage', TicketController.ticketMessageImageDelete)
