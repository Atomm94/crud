import PacketController from '../controller/PacketController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // Packet controller CRUD endpoints
    .post('Packet-addItem', 'packet', checkRole(), resource(), PacketController.add)
    .put('Packet-updateItem', 'packet', checkRole(), PacketController.update)
    .delete('Packet-destroyItem', 'packet', checkRole(), PacketController.destroy)
    .get('Packet-Product-getAllItems', 'packet', checkRole(), PacketController.getAll)
    .get('Packet-getAllItems', 'packetExtraSettings', checkRole(), PacketController.getExtraSettings)
    .get('Packet-Product-getItem', 'packet/:id', checkRole(), PacketController.get)
