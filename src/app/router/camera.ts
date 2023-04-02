import Router from 'koa-router'
import CameraController from '../controller/CameraController'
import checkRole from '../middleware/checkRole'

const router = new Router()

export default router
    // .post('CameraDevice-addItem', 'camera', checkRole(), CameraController.add)
    .put('CameraDevice-updateItem', 'camera', checkRole(), CameraController.update)
    .get('CameraDevice-getAllItems', 'camera', checkRole(), CameraController.getAll)
    .get('CameraDevice-getAllItems', '/camera/accessPoint/:id', checkRole(), CameraController.getAccessPointCameras)
    // .get('CameraDevice-getItem', 'camera/:id', checkRole(), CameraController.get)
    // .delete('CameraDevice-destroyItem', 'camera/:id', checkRole(), CameraController.destroy)
