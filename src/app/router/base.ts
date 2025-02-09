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
import MqttController from '../controller/MqttController'
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
  .post('sign-up', AuthController.sign_up)

  // Translation
  .post('Translation-addItem', 'translations', checkRole(), TranslationController.createTrans)
  .put('Translation-updateItem', 'translations', checkRole(), TranslationController.updateTrans)
  .delete('Translation-destroyItem', 'translations', checkRole(), TranslationController.deleteTrans)
  .get('Translation-getAllItems', 'translations', checkRole(), TranslationController.getTrans)

  // Module
  .get('Module-findModule', 'findModule', checkRole(), ModuleController.findModule)
  .get('Module-getModule', 'module', checkRole(), ModuleController.getModule)
  .get('Module-getModuleSelections', 'getSelections/:name', checkRole(), ModuleController.getModuleSelections)
  .post('Module-createModuleData', 'createModuleData', checkRole(), ModuleController.createModuleData)

  // Files

  .post('upload', FileController.saveFile)
  .delete('File-destroyItem', 'upload', checkRole(), FileController.deleteFile)

  // Language controller CRUD endpoints
  .post('Language-addItem', 'language', checkRole(), LanguageController.add)
  .put('Language-updateItem', 'language', checkRole(), LanguageController.update)
  .get('Language-getItem', 'language/:id', checkRole(), LanguageController.get)
  .delete('Language-destroyItem', 'language', LanguageController.destroy)
  .get('Language-getAllItems', 'language', checkRole(), LanguageController.getAll)

  // RegistrationInvite controller CRUD endpoints
  .post('RegistrationInvite-createLink', 'registrationInvite', checkRole(), RegistrationInviteController.add)
  // .put('registrationInvite', RegistrationInviteController.update)
  // .delete('registrationInvite', RegistrationInviteController.destroy)
  // .get('registrationInvite', RegistrationInviteController.getAll)

  // apis without model-action(role-acl)
  // -----------------------------------------------------

  .get('registration/:token', RegistrationInviteController.get)
  .post('Company-addItem', 'registration/:token', resource(), CompanyController.regValidation)
  .put('registration/:token', CompanyController.resendNewPassEmail)

  .get('registration/registrationOfPartition/:token', RegistrationInviteController.getPartition)
  .post('Company-addItem', 'registration/regPartition/:token', CompanyController.regPartitionValidation)
  .put('registration/:token', CompanyController.resendNewPassEmail)

  // -----------------------------------------------------

  .get('UserLog-get', 'userLog', checkRole(), LogController.getUserLogs)
  .get('EventLog-get', 'eventLog', checkRole(), LogController.getEventLogs)
  // Mqtt controller endpoints
  .get('mqttGetRequest/:id', MqttController.get)
  .post('mqttPostRequest', MqttController.post)
