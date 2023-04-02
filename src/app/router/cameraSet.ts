import Router from 'koa-router'
import CameraSetController from '../controller/CameraSetController'

const router = new Router()

export default router
    .post('CameraSet-addItem', 'camera-set', CameraSetController.add)
    .put('CameraSet-updateItem', 'camera-set', CameraSetController.update)
    .get('CameraSet-getAllItems', 'camera-set', CameraSetController.getAll)
    .get('CameraSet-getItem', 'camera-set/:id', CameraSetController.get)
    .delete('CameraSet-destroyItem', 'camera-set/:id', CameraSetController.delete)
