import Router from 'koa-router'
import CameraController from '../controller/CameraController'
import checkRole from '../middleware/checkRole'

const router = new Router()

export default router
    // .post('Camera-addItem', 'camera', checkRole(), CameraController.add)
    .put('Camera-updateItem', 'camera', checkRole(), CameraController.update)
    .get('Camera-getAllItems', 'camera', checkRole(), CameraController.getAll)
    .get('Camera-getAllItems', '/camera/accessPoint/:id', checkRole(), CameraController.getAccessPointCameras)
    // .get('Camera-getItem', 'camera/:id', checkRole(), CameraController.get)
    // .delete('Camera-destroyItem', 'camera/:id', checkRole(), CameraController.destroy)
