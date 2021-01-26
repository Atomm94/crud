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
        Feature.Cardholder.KeyStatus.check,
        Feature.AntiPassBack.HardAntiPassBack.check,
        Feature.AntiPassBack.SoftAntiPassBack.check,
        Feature.AntiPassBack.TimedAntiPassBack.check,
        CardholderController.add
    )
    .put('Cardholder-updateItem', 'cardholder',
        checkRole(),
        Feature.Cardholder.CardholderDeactivationByDate.check,
        Feature.Cardholder.CardholderDeactivationByLimit.check,
        Feature.Cardholder.KeyStatus.check,
        Feature.AntiPassBack.HardAntiPassBack.check,
        Feature.AntiPassBack.SoftAntiPassBack.check,
        Feature.AntiPassBack.TimedAntiPassBack.check,
        CardholderController.update
    )
    .delete('Cardholder-destroyItem', 'cardholder', checkRole(), CardholderController.destroy)
    .get('Cardholder-getAllItems', 'cardholder', checkRole(), CardholderController.getAll)

    .post('Cardholder-saveImage', 'cardholder/image', checkRole(), CardholderController.cardholderImageSave)
    .delete('Cardholder-deleteImage', 'cardholder/image', checkRole(), CardholderController.cardholderImageDelete)
    .get('Cardholder-getItem', 'cardholder/:id', checkRole(), CardholderController.get)
