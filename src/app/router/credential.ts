import CredentialController from '../controller/CredentialController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .post('Cardholder-addItem', 'credential', checkRole(), resource(), CredentialController.add)
    .put('Cardholder-updateItem', 'credential', checkRole(), CredentialController.update)
    .delete('Cardholder-destroyItem', 'credential', checkRole(), CredentialController.destroy)
    .get('Cardholder-getAllItems', 'credential', checkRole(), CredentialController.getAll)
    .get('Cardholder-getAllItems', 'credential/types', checkRole(), CredentialController.getCredentialTypes)
    .put('Cardholder-updateItem', 'credential/updateStatus', checkRole(), CredentialController.updateStatus)
    .get('Cardholder-getItem', 'credential/:id', checkRole(), CredentialController.get)
