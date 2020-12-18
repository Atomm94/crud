import CardholderGroupController from '../controller/CardholderGroupController'
import Router from 'koa-router'
const router = new Router()
export default router
    // CardholderGroup controller CRUD endpoints
    .post('CardholderGroup-addItem', 'cardholderGroup', CardholderGroupController.add)
    .put('CardholderGroup-updateItem', 'cardholderGroup', CardholderGroupController.update)
    .delete('CardholderGroup-destroyItem', 'cardholderGroup', CardholderGroupController.destroy)
    .get('CardholderGroup-getAllItems', 'cardholderGroup', CardholderGroupController.getAll)
    .get('CardholderGroup-getItem', 'cardholderGroup/:id', CardholderGroupController.get)
