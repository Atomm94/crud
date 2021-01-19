import CardholderGroupController from '../controller/CardholderGroupController'
import Router from 'koa-router'
import { Feature } from '../middleware/feature'
const router = new Router()
export default router
    // CardholderGroup controller CRUD endpoints
    .post('CardholderGroup-addItem', 'cardholderGroup',
        Feature.Cardholder.CardholderGroupOperation.check,
        Feature.Cardholder.CardholderGroupAccessRight.check,
        CardholderGroupController.add
    )
    .put('CardholderGroup-updateItem', 'cardholderGroup',
        Feature.Cardholder.CardholderGroupOperation.check,
        Feature.Cardholder.CardholderGroupAccessRight.check,
        CardholderGroupController.update
    )
    .delete('CardholderGroup-destroyItem', 'cardholderGroup', CardholderGroupController.destroy)
    .get('CardholderGroup-getAllItems', 'cardholderGroup', CardholderGroupController.getAll)
    .get('CardholderGroup-getItem', 'cardholderGroup/:id', CardholderGroupController.get)
