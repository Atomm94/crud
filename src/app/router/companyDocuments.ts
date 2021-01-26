import CompanyDocumentsController from '../controller/CompanyDocumentsController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  // CompanyDocuments controller CRUD endpoints
  .post('CompanyDocuments-addItem', 'document', checkRole(), CompanyDocumentsController.add)
  .put('CompanyDocuments-updateItem', 'document', checkRole(), CompanyDocumentsController.update)
  .delete('CompanyDocuments-destroyItem', 'document', checkRole(), CompanyDocumentsController.destroy)
  .get('CompanyDocuments-getAllItems', 'document', checkRole(), CompanyDocumentsController.getAll)

  .post('companyDocuments-saveFile', 'document/file', checkRole(), CompanyDocumentsController.companyFileUpload)
  .delete('companyDocuments-deleteFile', 'document/file', checkRole(), CompanyDocumentsController.companyFileDelete)
  .get('CompanyDocuments-getItem', 'document/:id', checkRole(), CompanyDocumentsController.get)
