import CardholderController from '../controller/CardholderController'
import Router from 'koa-router'
const router = new Router()
export default router
    // Cardholder controller CRUD endpoints
    .post('Cardholder-addItem', 'cardholder', CardholderController.add)
    .put('Cardholder-updateItem', 'cardholder', CardholderController.update)
    .delete('Cardholder-destroyItem', 'cardholder', CardholderController.destroy)
    .get('Cardholder-getAllItems', 'cardholder', CardholderController.getAll)
    .post('Cardholder-saveImage', 'cardholder/image', CardholderController.cardholderImageSave)
    .delete('Cardholder-deleteImage', 'cardholder/image', CardholderController.cardholderImageDelete)
    // .post('Cardholder-saveImage', 'cardholderImageSave', CardholderController.cardholderImageSave)
    // .delete('Cardholder-deleteImage', 'cardholderImageDelete', CardholderController.cardholderImageDelete)
    .get('Cardholder-getItem', 'cardholder/:id', CardholderController.get)
