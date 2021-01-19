import AdminController from '../controller/AdminController'
import Router from 'koa-router'
const router = new Router()
export default router

  .post('Admin-AdminOperation-addItem', 'account', AdminController.createAdmin)
  .post('Admin-AdminOperation-addItem', 'account/invite', AdminController.inviteAdmin)
  .delete('Admin-AdminOperation-destroyItem', 'account', AdminController.destroy)
  .put('Admin-AdminOperation-updateItem', 'account', AdminController.update)
  .get('Admin-AdminOperation-getAllItems', 'account', AdminController.getAll)
  .put('Admin-updateItem', 'account/changePass', AdminController.changePass) /// ???????????
  .put('Admin-updateItem', 'account/changeMyPass', AdminController.changeMyPass) /// ???????????
  .get('Admin-getItem', 'account/getUserData', AdminController.getUserData) /// ???????????
  .put('Admin-updateItem', 'account/myProfile', AdminController.update) /// ???????????

  .post('Admin-saveImage', 'account/image', AdminController.accountImageSave)
  .delete('Admin-deleteImage', 'account/image', AdminController.accountImageDelete)

  .get('account/invite/:token', AdminController.getUserByToken)
  .put('account/invite/:token', AdminController.setPassword)

  .get('Admin-AdminOperation-getItem', 'account/:id', AdminController.get)

  // .post('Admin-AdminOperation-addItem', 'user', AdminController.createAdmin)
  // .post('Admin-AdminOperation-addItem', 'inviteUsers', AdminController.inviteAdmin)
  // .delete('Admin-AdminOperation-destroyItem', 'user', AdminController.destroy)
  // .put('Admin-AdminOperation-updateItem', 'user', AdminController.update)
  // .get('Admin-AdminOperation-getItem', 'user/:id', AdminController.get)
  // .get('Admin-AdminOperation-getAllItems', 'user', AdminController.getAll)
  // .put('Admin-updateItem', 'changePass', AdminController.changePass)
  // .put('Admin-updateItem', 'changeMyPass', AdminController.changeMyPass)
  // .get('Admin-getItem', 'getUserData', AdminController.getUserData)
  // .put('Admin-updateItem', 'myProfile', AdminController.update)

  // .post('Admin-saveImage', 'accountImageSave', AdminController.accountImageSave)
  // .delete('Admin-deleteImage', 'accountImageDelete', AdminController.accountImageDelete)

  // .get('account/:token', AdminController.getUserByToken)
  // .put('account/:token', AdminController.setPassword)
