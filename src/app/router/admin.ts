import AdminController from '../controller/AdminController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router

  .post('Admin-addItem', 'account', checkRole(), resource(), AdminController.createAdmin)
  .post('Admin-addItem', 'account/invite', checkRole(), AdminController.inviteAdmin)
  .post('Admin-addItem', 'account/forgotPassword', AdminController.forgotPassword)

  .delete('Admin-destroyItem', 'account', checkRole(), AdminController.destroy)
  .put('Admin-updateItem', 'account', checkRole(), AdminController.update)
  .get('Admin-getAllItems', 'account', checkRole(), AdminController.getAll)
  .put('Admin-updateItem', 'account/changePass', checkRole(), AdminController.changePass) /// ???????????
  .put('Admin-updateItem', 'account/changeMyPass', checkRole(), AdminController.changeMyPass) /// ???????????
  .get('Admin-getItem', 'account/getUserData', checkRole(), AdminController.getUserData) /// ???????????
  .put('Admin-updateItem', 'account/myProfile', checkRole(), AdminController.update) /// ???????????

  .post('Admin-saveImage', 'account/image', checkRole(), AdminController.accountImageSave)
  .delete('Admin-deleteImage', 'account/image', checkRole(), AdminController.accountImageDelete)

  .get('account/invite/:token', AdminController.getUserByToken)
  .put('account/invite/:token', AdminController.setPassword)

  .put('Admin-updateItem', 'account/changeSettings', checkRole(), AdminController.changeSettings)

  .get('Admin-getItem', 'account/:id', AdminController.get)

  // .post('Admin-addItem', 'user', AdminController.createAdmin)
  // .post('Admin-addItem', 'inviteUsers', AdminController.inviteAdmin)
  // .delete('Admin-destroyItem', 'user', AdminController.destroy)
  // .put('Admin-updateItem', 'user', AdminController.update)
  // .get('Admin-getItem', 'user/:id', AdminController.get)
  // .get('Admin-getAllItems', 'user', AdminController.getAll)
  // .put('Admin-updateItem', 'changePass', AdminController.changePass)
  // .put('Admin-updateItem', 'changeMyPass', AdminController.changeMyPass)
  // .get('Admin-getItem', 'getUserData', AdminController.getUserData)
  // .put('Admin-updateItem', 'myProfile', AdminController.update)

  // .post('Admin-saveImage', 'accountImageSave', AdminController.accountImageSave)
  // .delete('Admin-deleteImage', 'accountImageDelete', AdminController.accountImageDelete)

  // .get('account/:token', AdminController.getUserByToken)
  // .put('account/:token', AdminController.setPassword)
