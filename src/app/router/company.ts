import CompanyController from '../controller/CompanyController'
import Router from 'koa-router'
import companyDocuments from './companyDocuments'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
  .use('company/', companyDocuments.routes(), companyDocuments.allowedMethods())
  // Company controller CRUD endpoints
  .post('Company-addItem', 'company', checkRole(), resource(), CompanyController.add)
  .put('Company-ServiceCompany-updateItem', 'company', checkRole(), resource(), CompanyController.update)
  .get('ServiceCompany-getItem', 'serviceCompany', checkRole(), resource(), CompanyController.getServiceCompany)
  .delete('Company-destroyItem', 'company', checkRole(), resource(), CompanyController.destroy)
  .get('Company-getAllItems', 'company', checkRole(), resource(), CompanyController.getAll)
  .get('Company-getItem', 'company/:id', checkRole(), resource(), CompanyController.get)
