import Testmodule1Controller from '../controller/Testmodule1Controller'
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

  .post('users', AdminController.createAdmin)
  .delete('users', AdminController.destroy)
  .put('users', AdminController.update)
  .get('users/:id', AdminController.get)
  .get('users', AdminController.getAll)
  .put('changePass', AdminController.changePass)
  .put('changeMyPass', AdminController.changeMyPass)
  .get('getUserData', AdminController.getUserData)
  .put('myProfile', AdminController.update)

  // Role

  .post('roles', RoleController.createRole)
  .get('roles/:id', RoleController.getRoleById)
  .put('roles', RoleController.updateRole)
  .delete('roles', RoleController.deleteRole)
  .get('roles', RoleController.getRole)

  // Translation
  .post('translations', TranslationController.createTrans)
  .put('translations', TranslationController.updateTrans)
  .delete('translations', TranslationController.deleteTrans)
  .get('translations', TranslationController.getTrans)

  // Slider

  .post('slider', SliderController.createSlider)
  .delete('slider', SliderController.deleteSlider)
  .put('slider', SliderController.updateSlider)
  .get('slider', SliderController.getSlider)

  // Social

  .post('social', SocialController.createSocialLink)
  .delete('social', SocialController.deleteSocialLink)
  .put('social', SocialController.updateSocialLink)
  .get('social', SocialController.getSocialLink)

  // Page

  .post('page', PageController.createPage)
  .delete('page', PageController.deletePage)

  .put('page', PageController.updatePage)
  .get('page', PageController.getPage)
  .get('page/:pageId', PageController.getPageById)
  .put('updatePageStatus', PageController.updatePageStatus)

  // Section
  .delete('section', SectionController.deleteSection)
  .get('section/:id', SectionController.getSectionById)
  .post('createSection', SectionController.createSection)
  .put('section', SectionController.updateSection)

  .get('findModule', ModuleController.findModule)
  .get('module', ModuleController.getModule)

  .get('getSelections/:name', ModuleController.getModuleSelections)
  .post('createModuleData', ModuleController.createModuleData)

  // Menu

  .post('menu', MenuController.createMenu)
  .delete('menu', MenuController.deleteMenu)
  .put('menu', MenuController.updateMenu)
  .get('menu', MenuController.getMenu)
  .put('updateMenuStatus', MenuController.updateMenuStatus)

  // Files

  .post('upload', FileController.saveFile)
  .delete('upload', FileController.deleteFile)

  // Testmodule1 controller CRUD endpoints
  .post('testmodule1', Testmodule1Controller.add)
  .put('testmodule1', Testmodule1Controller.update)
  .get('testmodule1/:id', Testmodule1Controller.get)
  .delete('testmodule1', Testmodule1Controller.destroy)
  .get('testmodule1', Testmodule1Controller.getAll)

  // Language controller CRUD endpoints
  .post('language', LanguageController.add)
  .put('language', LanguageController.update)
  .get('language/:id', LanguageController.get)
  .delete('language', LanguageController.destroy)
  .get('language', LanguageController.getAll)

  // Testmodule1 controller CRUD endpoints
  .post('testmodule1', Testmodule1Controller.add)
  .put('testmodule1', Testmodule1Controller.update)
  .get('testmodule1/:id', Testmodule1Controller.get)
  .delete('testmodule1', Testmodule1Controller.destroy)
  .get('testmodule1', Testmodule1Controller.getAll)
