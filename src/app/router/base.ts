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

  .post('Admin-addItem', 'users', AdminController.createAdmin)
  .delete('Admin-destroyItem', 'users', AdminController.destroy)
  .put('Admin-updateItem', 'users', AdminController.update)
  .get('Admin-getItem', 'users/:id', AdminController.get)
  .get('Admin-getAllItems', 'users', AdminController.getAll)
  .put('Admin-updateItem', 'changePass', AdminController.changePass)
  .put('Admin-updateItem', 'changeMyPass', AdminController.changeMyPass)
  .get('Admin-getItem', 'getUserData', AdminController.getUserData)
  .put('Admin-updateItem', 'myProfile', AdminController.update)

  .post('Admin-saveImage', 'userImageSave', AdminController.userImageSave)
  .delete('Admin-deleteImage', 'userImageDelete', AdminController.userImageDelete)

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

  // Ticket controller CRUD endpoints
  .post('Ticket-addItem', 'ticket', TicketController.add)
  .put('Ticket-updateItem', 'ticket', TicketController.update)
  .get('Ticket-getItem', 'ticket/:id', TicketController.get)
  .delete('Ticket-destroyItem', 'ticket', TicketController.destroy)
  .get('Ticket-getAllItems', 'ticket', TicketController.getAll)
  .post('Ticket-saveImage', 'ticketImage', TicketController.saveImage)
  .delete('Ticket-deleteImage', 'ticketImage', TicketController.deleteImage)

  // Department controller CRUD endpoints
  .post('Department-addItem', 'department', DepartmentController.add)
  .put('Department-updateItem', 'department', DepartmentController.update)
  .get('Department-getItem', 'department/:id', DepartmentController.get)
  .delete('Department-destroyItem', 'department', DepartmentController.destroy)
  .get('Department-getAllItems', 'department', DepartmentController.getAll)
