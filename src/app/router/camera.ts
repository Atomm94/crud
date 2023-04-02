import Router from 'koa-router'
import CameraController from '../controller/CameraController'

const router = new Router()

export default router
    // .post('Camera-addItem', 'camera', CameraController.add)
    .put('Camera-updateItem', 'camera', CameraController.update)
    .get('Camera-getAllItems', 'camera', CameraController.getAll)
    // .get('Camera-getItem', 'camera/:id', CameraController.get)
    // .delete('Camera-destroyItem', 'camera/:id', CameraController.destroy)
