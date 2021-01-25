import PacketController from '../controller/PacketController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // Packet controller CRUD endpoints
    .post('Packet-addItem', 'packet', checkRole(), resource(), PacketController.add)
    .put('Packet-updateItem', 'packet', checkRole(), resource(), PacketController.update)
    .delete('Packet-destroyItem', 'packet', checkRole(), resource(), PacketController.destroy)
    .get('Packet-Product-getAllItems', 'packet', checkRole(), resource(), PacketController.getAll)
    .get('Packet-getAllItems', 'packetExtraSettings', checkRole(), resource(), PacketController.getExtraSettings)
    .get('Packet-Product-getItem', 'packet/:id', checkRole(), resource(), PacketController.get)
