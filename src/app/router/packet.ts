import PacketController from '../controller/PacketController'
import Router from 'koa-router'
const router = new Router()
export default router
    // Packet controller CRUD endpoints
    .post('Packet-addItem', 'packet', PacketController.add)
    .put('Packet-updateItem', 'packet', PacketController.update)
    .get('Packet-Product-getItem', 'packet/:id', PacketController.get)
    .delete('Packet-destroyItem', 'packet', PacketController.destroy)
    .get('Packet-Product-getAllItems', 'packet', PacketController.getAll)
    .get('Packet-getAllItems', 'packet/extraSettings', PacketController.getExtraSettings)
