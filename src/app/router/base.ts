
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

const swaggerUi = require('swagger-ui-koa')

const router = new Router()

export default router
  .get('/', swaggerUi.setup(swaggerSpec))
  .get('swagger', swaggerUi.setup(swaggerSpec))

  // Auth
  .get('auth', AuthController.checkAuth)
  .post('login', AuthController.login)

  // Translation
  .post('Translation-addItem', 'translations', TranslationController.createTrans)
  .put('Translation-updateItem', 'translations', TranslationController.updateTrans)
  .delete('Translation-destroyItem', 'translations', TranslationController.deleteTrans)
  .get('Translation-getAllItems', 'translations', TranslationController.getTrans)

  // Module
  .get('Module-findModule', 'findModule', ModuleController.findModule)
  .get('Module-getModule', 'module', ModuleController.getModule)
  .get('Module-getModuleSelections', 'getSelections/:name', ModuleController.getModuleSelections)
  .post('Module-createModuleData', 'createModuleData', ModuleController.createModuleData)

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

  // Log controller CRUD endpoints
  .get('Log-getUserLogs', 'userLog', LogController.getUserLogs)
  .get('Log-getEventLogs', 'eventLog', LogController.getEventLogs)
