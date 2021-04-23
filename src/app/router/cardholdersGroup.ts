import CardholderGroupController from '../controller/CardholderGroupController'
import Router from 'koa-router'
import { Feature } from '../middleware/feature'
import checkRole from '../middleware/checkRole'
import resource from '../middleware/resource'
const router = new Router()
export default router
    // CardholderGroup controller CRUD endpoints
    .post('CardholderGroup-addItem', 'cardholderGroup',
        checkRole(),
        resource(),
        Feature.Cardholder.CardholderGroupOperation.check,
        Feature.Cardholder.CardholderGroupAccessRight.check,
        CardholderGroupController.add
    )
    .put('CardholderGroup-updateItem', 'cardholderGroup',
        checkRole(),
        Feature.Cardholder.CardholderGroupOperation.check,
        Feature.Cardholder.CardholderGroupAccessRight.check,
        CardholderGroupController.update
    )
    .delete('CardholderGroup-destroyItem', 'cardholderGroup',
        checkRole(),
        CardholderGroupController.destroy)
    .get('CardholderGroup-getAllItems', 'cardholderGroup',
        checkRole(),
        CardholderGroupController.getAll)
    .get('CardholderGroup-getItem', 'cardholderGroup/relations/:id',
        checkRole(),
        CardholderGroupController.getRelations)
    .get('CardholderGroup-getItem', 'cardholderGroup/:id',
        checkRole(),
        CardholderGroupController.get)
