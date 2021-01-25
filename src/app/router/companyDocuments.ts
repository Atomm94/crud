import CompanyDocumentsController from '../controller/CompanyDocumentsController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  // CompanyDocuments controller CRUD endpoints
  .post('CompanyDocuments-addItem', 'document', checkRole(), resource(), CompanyDocumentsController.add)
  .put('CompanyDocuments-updateItem', 'document', checkRole(), resource(), CompanyDocumentsController.update)
  .delete('CompanyDocuments-destroyItem', 'document', checkRole(), resource(), CompanyDocumentsController.destroy)
  .get('CompanyDocuments-getAllItems', 'document', checkRole(), resource(), CompanyDocumentsController.getAll)

  .post('companyDocuments-saveFile', 'document/file', checkRole(), resource(), CompanyDocumentsController.companyFileUpload)
  .delete('companyDocuments-deleteFile', 'document/file', checkRole(), resource(), CompanyDocumentsController.companyFileDelete)
  .get('CompanyDocuments-getItem', 'document/:id', checkRole(), resource(), CompanyDocumentsController.get)
