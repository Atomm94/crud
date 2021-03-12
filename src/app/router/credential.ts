import CredentialController from '../controller/CredentialController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // AccessPoint controller CRUD endpoints
    .post('Credential-addItem', 'credential', checkRole(), resource(), CredentialController.add)
    .put('Credential-updateItem', 'credential', checkRole(), CredentialController.update)
    .delete('Credential-destroyItem', 'credential', checkRole(), CredentialController.destroy)
    .get('Credential-getAllItems', 'credential', checkRole(), CredentialController.getAll)
    .get('Credential-getAllItems', 'credential/types', checkRole(), CredentialController.getCredentialTypes)
    .put('Credential-updateItem', 'credential/updateStatus', checkRole(), CredentialController.updateStatus)
    .get('Credential-getItem', 'credential/:id', checkRole(), CredentialController.get)
