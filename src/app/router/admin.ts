import AdminController from '../controller/AdminController'
import Router from 'koa-router'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router

  .post('Admin-addItem', 'account', checkRole(), resource(), AdminController.createAdmin)
  .post('Admin-addItem', 'account/invite', checkRole(), resource(), AdminController.inviteAdmin)
  .delete('Admin-destroyItem', 'account', checkRole(), resource(), AdminController.destroy)
  .put('Admin-updateItem', 'account', checkRole(), resource(), AdminController.update)
  .get('Admin-getAllItems', 'account', checkRole(), resource(), AdminController.getAll)
  .put('Admin-updateItem', 'account/changePass', checkRole(), resource(), AdminController.changePass) /// ???????????
  .put('Admin-updateItem', 'account/changeMyPass', checkRole(), resource(), AdminController.changeMyPass) /// ???????????
  .get('Admin-getItem', 'account/getUserData', checkRole(), resource(), AdminController.getUserData) /// ???????????
  .put('Admin-updateItem', 'account/myProfile', checkRole(), resource(), AdminController.update) /// ???????????

  .post('Admin-saveImage', 'account/image', checkRole(), resource(), AdminController.accountImageSave)
  .delete('Admin-deleteImage', 'account/image', checkRole(), resource(), AdminController.accountImageDelete)

  .get('account/invite/:token', AdminController.getUserByToken)
  .put('account/invite/:token', AdminController.setPassword)

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
