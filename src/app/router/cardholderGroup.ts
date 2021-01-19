import CardholderGroupController from '../controller/CardholderGroupController'
import Router from 'koa-router'
const router = new Router()
export default router
// CardholderGroup controller CRUD endpoints

  .post('CardholderGroup-addItem', '/', CardholderGroupController.add)
  .put('CardholderGroup-updateItem', '/', CardholderGroupController.update)
  .delete('CardholderGroup-destroyItem', '/', CardholderGroupController.destroy)
  .get('CardholderGroup-getAllItems', '/', CardholderGroupController.getAll)
  .get('CardholderGroup-getAllItems', '/relations/:id', CardholderGroupController.getRelations)

  .get('CardholderGroup-getItem', '/:id', CardholderGroupController.get)
