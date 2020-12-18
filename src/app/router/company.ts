import CompanyController from '../controller/CompanyController'
import Router from 'koa-router'
import companyDocuments from './companyDocuments'
const router = new Router()
export default router
  .use('/', companyDocuments.routes(), companyDocuments.allowedMethods())
  // Company controller CRUD endpoints
  .post('Company-addItem', 'company', CompanyController.add)
  .put('Company-ServiceCompany-updateItem', 'company', CompanyController.update)
  .get('ServiceCompany-getItem', 'serviceCompany', CompanyController.getServiceCompany)
  .delete('Company-destroyItem', 'company', CompanyController.destroy)
  .get('Company-getAllItems', 'company', CompanyController.getAll)
  .get('Company-getItem', 'company/:id', CompanyController.get)
