import PacketTypeController from '../controller/PacketTypeController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // PacketType controller CRUD endpoints
  .post('PacketType-addItem', 'packetType', checkRole(), resource(), PacketTypeController.add)
  .put('PacketType-updateItem', 'packetType', checkRole(), resource(), PacketTypeController.update)
  .delete('PacketType-destroyItem', 'packetType', checkRole(), resource(), PacketTypeController.destroy)
  .get('PacketType-getAllItems', 'packetType', checkRole(), resource(), PacketTypeController.getAll)
  .get('PacketType-getItem', 'packetType/:id', checkRole(), resource(), PacketTypeController.get)
