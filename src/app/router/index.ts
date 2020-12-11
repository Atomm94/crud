import base from './base'
import timeframe from './timeframe'
import Router from 'koa-router'

const router = new Router()

router.use('/', base.routes(), base.allowedMethods())
router.use('/timeframe', timeframe.routes(), timeframe.allowedMethods())

export {
    router
}
