import PacketTypeController from '../controller/PacketTypeController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // PacketType controller CRUD endpoints
  .post('PacketType-addItem', 'packetType', checkRole(), PacketTypeController.add)
  .put('PacketType-updateItem', 'packetType', checkRole(), PacketTypeController.update)
  .delete('PacketType-destroyItem', 'packetType', checkRole(), PacketTypeController.destroy)
  .get('PacketType-getAllItems', 'packetType', checkRole(), PacketTypeController.getAll)
  .get('PacketType-getItem', 'packetType/:id', checkRole(), PacketTypeController.get)
