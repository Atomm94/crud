import ZohoController from '../controller/ZohoController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // Zoho controller CRUD endpoints
  .post('Zoho-addItem', 'zoho', checkRole(), ZohoController.add)
  .put('Zoho-updateItem', 'zoho', checkRole(), ZohoController.update)
  .delete('Zoho-destroyItem', 'zoho', checkRole(), ZohoController.destroy)
  .get('zoho/code', ZohoController.getCodeOfZoho)
  .post('zoho/callback', ZohoController.zohoCallback)
  .get('Zoho-getAllItems', 'zoho', checkRole(), ZohoController.getAll)
  .get('Zoho-getItem', 'zoho/:id', checkRole(), ZohoController.get)
