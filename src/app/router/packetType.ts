import PacketTypeController from '../controller/PacketTypeController'
import Router from 'koa-router'
const router = new Router()
export default router
  // PacketType controller CRUD endpoints
  .post('PacketType-addItem', 'packetType', PacketTypeController.add)
  .put('PacketType-updateItem', 'packetType', PacketTypeController.update)
  .get('PacketType-getItem', 'packetType/:id', PacketTypeController.get)
  .delete('PacketType-destroyItem', 'packetType', PacketTypeController.destroy)
  .get('PacketType-getAllItems', 'packetType', PacketTypeController.getAll)
