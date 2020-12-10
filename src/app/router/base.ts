import TimeframeController from '../controller/TimeframeController'
import EntryController from '../controller/EntryController'
import AccessRightGroupController from '../controller/AccessRightGroupController'
import AccessRightController from '../controller/AccessRightController'
import ScheduleController from '../controller/ScheduleController'
// import CarInfoController from '../controller/CarInfoController'
import AccountGroupController from '../controller/AccountGroupController'
import UserController from '../controller/UserController'
import CompanyDocumentsController from '../controller/CompanyDocumentsController'
import CompanyController from '../controller/CompanyController'
import RegistrationInviteController from '../controller/RegistrationInviteController'
import PacketTypeController from '../controller/PacketTypeController'
import PacketController from '../controller/PacketController'
import DepartmentController from '../controller/DepartmentController'
import TicketController from '../controller/TicketController'
import SectionController from '../controller/SectionController'

import {
  AdminController,
  AuthController,
  RoleController,
  TranslationController,
  SliderController,
  SocialController,
  PageController,
  MenuController,
  LanguageController,
  ModuleController,
  FileController
} from '../controller'

import Router from 'koa-router'
import swaggerSpec from '../../component/swagger'

const swaggerUi = require('swagger-ui-koa')

const router = new Router()

export default router
  .get('/', swaggerUi.setup(swaggerSpec))
  .get('swagger', swaggerUi.setup(swaggerSpec))

  // Admin
  .get('auth', AuthController.checkAuth)
  .post('login', AuthController.login)

  .post('Admin-AdminOperation-addItem', 'users', AdminController.createAdmin)
  .post('Admin-AdminOperation-addItem', 'inviteUsers', AdminController.inviteAdmin)
  .delete('Admin-AdminOperation-destroyItem', 'users', AdminController.destroy)
  .put('Admin-AdminOperation-updateItem', 'users', AdminController.update)
  .get('Admin-AdminOperation-getItem', 'users/:id', AdminController.get)
  .get('Admin-AdminOperation-getAllItems', 'users', AdminController.getAll)
  .put('Admin-updateItem', 'changePass', AdminController.changePass)
  .put('Admin-updateItem', 'changeMyPass', AdminController.changeMyPass)
  .get('Admin-getItem', 'getUserData', AdminController.getUserData)
  .put('Admin-updateItem', 'myProfile', AdminController.update)

  .post('Admin-saveImage', 'accountImageSave', AdminController.accountImageSave)
  .delete('Admin-deleteImage', 'accountImageDelete', AdminController.accountImageDelete)

  // Role
  .post('Role-addItem', 'roles', RoleController.createRole)
  .get('Role-getItem', 'roles/:id', RoleController.getRoleById)
  .put('Role-updateItem', 'roles', RoleController.updateRole)
  .delete('Role-destroyItem', 'roles', RoleController.deleteRole)
  .get('Role-getAllItems', 'roles', RoleController.getRole)
  .get('Role-getAllItems', 'access', RoleController.getAllAccess)

  // Translation
  .post('Translation-addItem', 'translations', TranslationController.createTrans)
  .put('Translation-updateItem', 'translations', TranslationController.updateTrans)
  .delete('Translation-destroyItem', 'translations', TranslationController.deleteTrans)
  .get('Translation-getAllItems', 'translations', TranslationController.getTrans)

  // Slider

  .post('Slider-addItem', 'slider', SliderController.createSlider)
  .delete('Slider-destroyItem', 'slider', SliderController.deleteSlider)
  .put('Slider-updateItem', 'slider', SliderController.updateSlider)
  .get('Slider-getAllItems', 'slider', SliderController.getSlider)

  // Social

  .post('Social-addItem', 'social', SocialController.createSocialLink)
  .delete('Social-destroyItem', 'social', SocialController.deleteSocialLink)
  .put('Social-updateItem', 'social', SocialController.updateSocialLink)
  .get('Social-getAllItems', 'social', SocialController.getSocialLink)

  // Page

  .post('Page-addItem', 'page', PageController.createPage)
  .delete('Page-destroyItem', 'page', PageController.deletePage)

  .put('Page-updateItem', 'page', PageController.updatePage)
  .get('Page-getPageWithSection', 'page', PageController.getPage)
  .get('Page-getPageById', 'page/:pageId', PageController.getPageById)
  .put('Page-updateItem', 'updatePageStatus', PageController.updatePageStatus)

  // Section
  .delete('Section-destroyItem', 'section', SectionController.deleteSection)
  .get('Section-getItem', 'section/:id', SectionController.getSectionById)
  .post('Section-addItem', 'createSection', SectionController.createSection)
  .put('Section-updateItem', 'section', SectionController.updateSection)

  // Module
  .get('Module-findModule', 'findModule', ModuleController.findModule)
  .get('Module-getModule', 'module', ModuleController.getModule)
  .get('Module-getModuleSelections', 'getSelections/:name', ModuleController.getModuleSelections)
  .post('Module-createModuleData', 'createModuleData', ModuleController.createModuleData)

  // Menu

  .post('Menu-addItem', 'menu', MenuController.createMenu)
  .delete('Menu-destroyItem', 'menu', MenuController.deleteMenu)
  .put('Menu-updateItem', 'menu', MenuController.updateMenu)
  .get('Menu-getAllItems', 'menu', MenuController.getMenu)
  .put('Menu-updateItem', 'updateMenuStatus', MenuController.updateMenuStatus)

  // Files

  .post('upload', FileController.saveFile)
  .delete('File-destroyItem', 'upload', FileController.deleteFile)

  // Language controller CRUD endpoints
  .post('Language-addItem', 'language', LanguageController.add)
  .put('Language-updateItem', 'language', LanguageController.update)
  .get('Language-getItem', 'language/:id', LanguageController.get)
  .delete('Language-destroyItem', 'language', LanguageController.destroy)
  .get('Language-getAllItems', 'language', LanguageController.getAll)

  // Packet controller CRUD endpoints
  .post('Packet-addItem', 'packet', PacketController.add)
  .put('Packet-updateItem', 'packet', PacketController.update)
  .get('Packet-Product-getItem', 'packet/:id', PacketController.get)
  .delete('Packet-destroyItem', 'packet', PacketController.destroy)
  .get('Packet-Product-getAllItems', 'packet', PacketController.getAll)
  .get('Packet-getAllItems', 'packetExtraSettings', PacketController.getExtraSettings)

  // PacketType controller CRUD endpoints
  .post('PacketType-addItem', 'packetType', PacketTypeController.add)
  .put('PacketType-updateItem', 'packetType', PacketTypeController.update)
  .get('PacketType-getItem', 'packetType/:id', PacketTypeController.get)
  .delete('PacketType-destroyItem', 'packetType', PacketTypeController.destroy)
  .get('PacketType-getAllItems', 'packetType', PacketTypeController.getAll)

  // Ticket controller CRUD endpoints
  .post('Ticket-addItem', 'ticket', TicketController.add)
  .put('Ticket-updateItem', 'ticket', TicketController.update)
  .get('Ticket-getItem', 'ticket/:id', TicketController.get)
  .delete('Ticket-destroyItem', 'ticket', TicketController.destroy)
  .get('Ticket-getAllItems', 'ticket', TicketController.getAll)
  .post('Ticket-saveImage', 'ticketImage', TicketController.saveImage)
  .delete('Ticket-deleteImage', 'ticketImage', TicketController.deleteImage)

  .post('Ticket-addMessage', 'addTicketMessage', TicketController.addTicketMessage)
  .put('Ticket-updateMessage', 'updateTicketMessage', TicketController.updateTicketMessage)
  .get('Ticket-getMessage', 'getTicketMessage/:id', TicketController.getTicketMessage)
  .delete('Ticket-destroyMessage', 'destroyTicketMessage', TicketController.destroyTicketMessage)
  .get('Ticket-getAllMessages', 'getAllTicketMessages', TicketController.getAllTicketMessages)

  .post('Ticket-saveMessageImage', 'ticketMessageImage', TicketController.ticketMessageImageSave)
  .delete('Ticket-deleteMessageImage', 'ticketMessageImage', TicketController.ticketMessageImageDelete)

  // Department controller CRUD endpoints
  .post('Department-addItem', 'department', DepartmentController.add)
  .put('Department-updateItem', 'department', DepartmentController.update)
  .get('Department-getItem', 'department/:id', DepartmentController.get)
  .delete('Department-destroyItem', 'department', DepartmentController.destroy)
  .get('Department-getAllItems', 'department', DepartmentController.getAll)

  // Company controller CRUD endpoints
  .post('Company-addItem', 'company', CompanyController.add)
  .put('Company-ServiceCompany-updateItem', 'company', CompanyController.update)
  .get('Company-getItem', 'company/:id', CompanyController.get)
  .get('ServiceCompany-getItem', 'serviceCompany', CompanyController.getServiceCompany)
  .delete('Company-destroyItem', 'company', CompanyController.destroy)
  .get('Company-getAllItems', 'company', CompanyController.getAll)

  // CompanyDocuments controller CRUD endpoints
  .post('CompanyDocuments-addItem', 'companyDocuments', CompanyDocumentsController.add)
  .put('CompanyDocuments-updateItem', 'companyDocuments', CompanyDocumentsController.update)
  .get('CompanyDocuments-getItem', 'companyDocuments/:id', CompanyDocumentsController.get)
  .delete('CompanyDocuments-destroyItem', 'companyDocuments', CompanyDocumentsController.destroy)
  .get('CompanyDocuments-getAllItems', 'companyDocuments', CompanyDocumentsController.getAll)

  .post('companyDocuments-saveFile', 'companyFileUpload', CompanyDocumentsController.companyFileUpload)
  .delete('companyDocuments-deleteFile', 'companyFileDelete', CompanyDocumentsController.companyFileDelete)

  // RegistrationInvite controller CRUD endpoints
  .post('RegistrationInvite-createLink', 'registrationInvite', RegistrationInviteController.add)
  // .put('registrationInvite', RegistrationInviteController.update)
  // .delete('registrationInvite', RegistrationInviteController.destroy)
  // .get('registrationInvite', RegistrationInviteController.getAll)

  // apis without model-action(role-acl)
  // -----------------------------------------------------

  .get('registration/:token', RegistrationInviteController.get)
  .post('registration/:token', CompanyController.regValidation)
  .put('registration/:token', CompanyController.resendNewPassEmail)
  .get('account/:token', AdminController.getUserByToken)
  .put('account/:token', AdminController.setPassword)

  // -----------------------------------------------------

  // AccountGroup controller CRUD endpoints
  .post('AccountGroup-addItem', 'accountGroup', AccountGroupController.add)
  .put('AccountGroup-updateItem', 'accountGroup', AccountGroupController.update)
  .get('AccountGroup-getItem', 'accountGroup/:id', AccountGroupController.get)
  .delete('AccountGroup-destroyItem', 'accountGroup', AccountGroupController.destroy)
  .get('AccountGroup-getAllItems', 'accountGroup', AccountGroupController.getAll)
  .get('AccountGroup-getGroupAccountsCounts', 'accountGroupAccounts/:id', AccountGroupController.getGroupAccountsCounts)
  // User controller CRUD endpoints

  .get('User-getItem', 'user/:id', UserController.get)
  .post('User-addItem', 'user', UserController.add)
  .put('User-updateItem', 'user', UserController.update)
  .delete('User-destroyItem', 'user', UserController.destroy)
  .get('User-getAllItems', 'user', UserController.getAll)

  .post('User-saveImage', 'userImageSave', UserController.userImageSave)
  .delete('User-deleteImage', 'userImageDelete', UserController.userImageDelete)

  // CarInfo controller CRUD endpoints
  // .post('CarInfo-addItem', 'carInfo', CarInfoController.add)
  // .put('CarInfo-updateItem', 'carInfo', CarInfoController.update)
  // .get('CarInfo-getItem', 'carInfo/:id', CarInfoController.get)
  // .delete('CarInfo-destroyItem', 'carInfo', CarInfoController.destroy)
  // .get('CarInfo-getAllItems', 'carInfo', CarInfoController.getAll)

  // Schedule controller CRUD endpoints
  .post('schedule', ScheduleController.add)
  .put('schedule', ScheduleController.update)
  .get('schedule/:id', ScheduleController.get)
  .delete('schedule', ScheduleController.destroy)
  .get('schedule', ScheduleController.getAll)

  // Timeframe controller CRUD endpoints
  .post('timeframe', TimeframeController.add)
  .put('timeframe', TimeframeController.update)
  .get('timeframe/:id', TimeframeController.get)
  .delete('timeframe', TimeframeController.destroy)
  .get('timeframe', TimeframeController.getAll)

  // Entry controller CRUD endpoints
  .post('entry', EntryController.add)
  .put('entry', EntryController.update)
  .get('entry/:id', EntryController.get)
  .delete('entry', EntryController.destroy)
  .get('entry', EntryController.getAll)

  // AccessRight controller CRUD endpoints
  .post('accessRight', AccessRightController.add)
  .put('accessRight', AccessRightController.update)
  .get('accessRight/:id', AccessRightController.get)
  .delete('accessRight', AccessRightController.destroy)
  .get('accessRight', AccessRightController.getAll)

  // AccessRightGroup controller CRUD endpoints
  .post('accessRightGroup', AccessRightGroupController.add)
  .put('accessRightGroup', AccessRightGroupController.update)
  .get('accessRightGroup/:id', AccessRightGroupController.get)
  .delete('accessRightGroup', AccessRightGroupController.destroy)
  .get('accessRightGroup', AccessRightGroupController.getAll)
