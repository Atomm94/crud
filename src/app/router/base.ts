
import CompanyController from '../controller/CompanyController'
import RegistrationInviteController from '../controller/RegistrationInviteController'

import {
  AuthController,
  TranslationController,
  LanguageController,
  ModuleController,
  FileController
} from '../controller'

import Router from 'koa-router'
import swaggerSpec from '../../component/swagger'
import LogController from '../controller/LogController'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'

const swaggerUi = require('swagger-ui-koa')

const router = new Router()

export default router
  .get('/', swaggerUi.setup(swaggerSpec))
  .get('swagger', swaggerUi.setup(swaggerSpec))

  // Auth
  .get('auth', AuthController.checkAuth)
  .post('login', AuthController.login)

  // Translation
  .post('Translation-addItem', 'translations', checkRole(), resource(), TranslationController.createTrans)
  .put('Translation-updateItem', 'translations', checkRole(), resource(), TranslationController.updateTrans)
  .delete('Translation-destroyItem', 'translations', checkRole(), resource(), TranslationController.deleteTrans)
  .get('Translation-getAllItems', 'translations', checkRole(), resource(), TranslationController.getTrans)

  // Module
  .get('Module-findModule', 'findModule', checkRole(), resource(), ModuleController.findModule)
  .get('Module-getModule', 'module', checkRole(), resource(), ModuleController.getModule)
  .get('Module-getModuleSelections', 'getSelections/:name', checkRole(), resource(), ModuleController.getModuleSelections)
  .post('Module-createModuleData', 'createModuleData', checkRole(), resource(), ModuleController.createModuleData)

  // Files

  .post('upload', FileController.saveFile)
  .delete('File-destroyItem', 'upload', checkRole(), resource(), FileController.deleteFile)

  // Language controller CRUD endpoints
  .post('Language-addItem', 'language', checkRole(), resource(), LanguageController.add)
  .put('Language-updateItem', 'language', checkRole(), resource(), LanguageController.update)
  .get('Language-getItem', 'language/:id', checkRole(), resource(), LanguageController.get)
  .delete('Language-destroyItem', 'language', LanguageController.destroy)
  .get('Language-getAllItems', 'language', checkRole(), resource(), LanguageController.getAll)

  // RegistrationInvite controller CRUD endpoints
  .post('RegistrationInvite-createLink', 'registrationInvite', checkRole(), resource(), RegistrationInviteController.add)
  // .put('registrationInvite', RegistrationInviteController.update)
  // .delete('registrationInvite', RegistrationInviteController.destroy)
  // .get('registrationInvite', RegistrationInviteController.getAll)

  // apis without model-action(role-acl)
  // -----------------------------------------------------

  .get('registration/:token', RegistrationInviteController.get)
  .post('registration/:token', CompanyController.regValidation)
  .put('registration/:token', CompanyController.resendNewPassEmail)

  // Log controller CRUD endpoints
  .get('Log-getUserLogs', 'userLog', checkRole(), resource(), LogController.getUserLogs)
  .get('Log-getEventLogs', 'eventLog', checkRole(), resource(), LogController.getEventLogs)
