import CompanyController from '../controller/CompanyController'
import RegistrationInviteController from '../controller/RegistrationInviteController'
import SectionController from '../controller/SectionController'

import {
  AuthController,
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

  // -----------------------------------------------------

  // CarInfo controller CRUD endpoints
  // .post('CarInfo-addItem', 'carInfo', CarInfoController.add)
  // .put('CarInfo-updateItem', 'carInfo', CarInfoController.update)
  // .get('CarInfo-getItem', 'carInfo/:id', CarInfoController.get)
  // .delete('CarInfo-destroyItem', 'carInfo', CarInfoController.destroy)
  // .get('CarInfo-getAllItems', 'carInfo', CarInfoController.getAll)
