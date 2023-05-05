import Router from 'koa-router'
import CameraSetController from '../controller/CameraSetController'
import checkRole from '../middleware/checkRole'

const router = new Router()

export default router
    .post('CameraSet-addItem', 'camera-set', checkRole(), CameraSetController.add)
    .put('CameraSet-updateItem', 'camera-set', checkRole(), CameraSetController.update)
    .get('CameraSet-getAllItems', 'camera-set', checkRole(), CameraSetController.getAll)
    .get('CameraSet-getAllItems', 'camera-set/livestream/:id', checkRole(), CameraSetController.getLivestream)
    .get('CameraSet-getItem', 'camera-set/:id', checkRole(), CameraSetController.get)
    .delete('CameraSet-destroyItem', 'camera-set/:id', checkRole(), CameraSetController.destroy)
