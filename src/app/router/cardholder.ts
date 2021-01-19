import CardholderController from '../controller/CardholderController'
import Router from 'koa-router'
import { Feature } from '../middleware/feature'
const router = new Router()
export default router
    // Cardholder controller CRUD endpoints
    .post('Cardholder-addItem', 'cardholder',
        Feature.Cardholder.CardholderDeactivationByDate.check,
        Feature.Cardholder.CardholderDeactivationByLimit.check,
        Feature.Cardholder.KeyStatus.check,
        Feature.AntiPassBack.HardAntiPassBack.check,
        Feature.AntiPassBack.SoftAntiPassBack.check,
        Feature.AntiPassBack.TimedAntiPassBack.check,
        CardholderController.add
    )
    .put('Cardholder-updateItem', 'cardholder',
        Feature.Cardholder.CardholderDeactivationByDate.check,
        Feature.Cardholder.CardholderDeactivationByLimit.check,
        Feature.Cardholder.KeyStatus.check,
        Feature.AntiPassBack.HardAntiPassBack.check,
        Feature.AntiPassBack.SoftAntiPassBack.check,
        Feature.AntiPassBack.TimedAntiPassBack.check,
        CardholderController.update
    )
    .delete('Cardholder-destroyItem', 'cardholder', CardholderController.destroy)
    .get('Cardholder-getAllItems', 'cardholder', CardholderController.getAll)

    .post('Cardholder-saveImage', 'cardholderImageSave', CardholderController.cardholderImageSave)
    .delete('Cardholder-deleteImage', 'cardholderImageDelete', CardholderController.cardholderImageDelete)
    .get('Cardholder-getItem', 'cardholder/:id', CardholderController.get)
