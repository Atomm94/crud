import CardholderController from '../controller/CardholderController'
import Router from 'koa-router'
import { Feature } from '../middleware/feature'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'

const router = new Router()
export default router
    // Cardholder controller CRUD endpoints
    .post('Cardholder-addItem', 'cardholder',
        checkRole(),
        resource(),
        Feature.Cardholder.CardholderDeactivationByDate.check,
        Feature.Cardholder.CardholderDeactivationByLimit.check,
        CardholderController.add
    )
    .put('Cardholder-updateItem', 'cardholder',
        checkRole(),
        Feature.Cardholder.CardholderDeactivationByDate.check,
        Feature.Cardholder.CardholderDeactivationByLimit.check,
        CardholderController.update
    )
    .delete('Cardholder-destroyItem', 'cardholder', checkRole(), CardholderController.destroy)
    .get('Cardholder-getAllItems', 'cardholder', checkRole(), CardholderController.getAll)

    .post('Cardholder-saveImage', 'cardholder/image', checkRole(), CardholderController.cardholderImageSave)
    .delete('Cardholder-deleteImage', 'cardholder/image', checkRole(), CardholderController.cardholderImageDelete)
    .put('Cardholder-updateItem', 'cardholder/update/bulk', checkRole(), CardholderController.updateMultipleCardholders)
    .post('Cardholder-addItem', 'cardholder/inviteCardholder', checkRole(), CardholderController.inviteCardholder)
    .get('Cardholder-getAllItems', 'cardholder/guests', checkRole(), CardholderController.getAllGuests)

    .post('Cardholder-addItem', 'cardholder/guest', checkRole(), CardholderController.addGuest)
    .put('Cardholder-updateItem', 'cardholder/guest', checkRole(), CardholderController.updateGuest)
    .post('Cardholder-addItem', 'cardholder/addFromCabinet', checkRole(), CardholderController.addFromCabinet)
    .put('Cardholder-updateItem', 'cardholder/updateFromCabinet', checkRole(), CardholderController.updateFromCabinet)

    .put('cardholder/invite/:token', CardholderController.setCardholderPassword)

    .get('Cardholder-getItem', 'cardholder/:id', checkRole(), CardholderController.get)
