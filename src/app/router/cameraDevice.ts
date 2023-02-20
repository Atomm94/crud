import Router from 'koa-router'
import CameraDeviceController from '../controller/CameraDeviceController'
import checkRole from '../middleware/checkRole'
// import checkRole from '../middleware/checkRole'

const router = new Router()
export default router
    .post('CameraDevice-addItem', 'camera-device', checkRole(), CameraDeviceController.add)
    .put('CameraDevice-updateItem', 'camera-device', checkRole(), CameraDeviceController.update)
    .delete('CameraDevice-destroyItem', 'camera-device/:id', checkRole(), CameraDeviceController.delete)
    .get('CameraDevice-getAllItems', 'camera-device', checkRole(), CameraDeviceController.getAll)
    .get('CameraDevice-getItem', 'camera-device/:id', checkRole(), CameraDeviceController.get)
