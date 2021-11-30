import CompanyController from '../controller/CompanyController'
import Router from 'koa-router'
import companyDocuments from './companyDocuments'
import checkRole from '../middleware/checkRole'
const router = new Router()
export default router
  .use('company/', companyDocuments.routes(), companyDocuments.allowedMethods())
  // Company controller CRUD endpoints
  .post('Company-addItem', 'company', checkRole(), CompanyController.add)
  .put('Company-ClientCompany-updateItem', 'company', checkRole(), CompanyController.update)
  .get('ServiceCompany-getItem', 'serviceCompany', checkRole(), CompanyController.getServiceCompany)
  .get('Company-ClientCompany-getItem', 'clientCompany', checkRole(), CompanyController.getClientCompany)
  .delete('Company-destroyItem', 'company', checkRole(), CompanyController.destroy)
  .get('Company-getAllItems', 'company', checkRole(), CompanyController.getAll)
  .get('Company-ClientCompany-getItem', 'company/companyResource', checkRole(), CompanyController.checkResourceLimit)
  .get('Company-getItem', 'company/:id', checkRole(), CompanyController.get)
