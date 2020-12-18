import EntryController from '../controller/EntryController'
import Router from 'koa-router'
const router = new Router()
export default router
    // Entry controller CRUD endpoints
    .post('Entry-addItem', 'entry', EntryController.add)
    .put('Entry-updateItem', 'entry', EntryController.update)
    .get('Entry-getItem', 'entry/:id', EntryController.get)
    .delete('Entry-destroyItem', 'entry', EntryController.destroy)
    .get('Entry-getAllItems', 'entry', EntryController.getAll)
