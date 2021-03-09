import accessPointController from '../controller/AccessPointController'
import Router from 'koa-router'
import timeframe from './timeframe'
const router = new Router()
export default router
// Timeframe controller CRUD endpoints
  .use('/timeframe', timeframe.routes(), timeframe.allowedMethods())

  .post('accessPoint-addItem', '/', accessPointController.add)
  .put('accessPoint-updateItem', '/', accessPointController.update)
  .delete('accessPoint-destroyItem', '/', accessPointController.destroy)
  .get('accessPoint-getAllItems', '/', accessPointController.getAll)
  .delete('accessPoint-destroyItem', '/reader', accessPointController.readerDestroy)
  .get('accessPoint-getItem', '/:id', accessPointController.get)
