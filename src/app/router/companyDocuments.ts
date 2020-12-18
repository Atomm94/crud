import CompanyDocumentsController from '../controller/CompanyDocumentsController'
import Router from 'koa-router'
const router = new Router()
export default router
  // CompanyDocuments controller CRUD endpoints
  .post('CompanyDocuments-addItem', 'companyDocuments', CompanyDocumentsController.add)
  .put('CompanyDocuments-updateItem', 'companyDocuments', CompanyDocumentsController.update)
  .delete('CompanyDocuments-destroyItem', 'companyDocuments', CompanyDocumentsController.destroy)
  .get('CompanyDocuments-getAllItems', 'companyDocuments', CompanyDocumentsController.getAll)

  .post('companyDocuments-saveFile', 'company/file', CompanyDocumentsController.companyFileUpload)
  .delete('companyDocuments-deleteFile', 'company/file', CompanyDocumentsController.companyFileDelete)
  .get('CompanyDocuments-getItem', 'companyDocuments/:id', CompanyDocumentsController.get)
