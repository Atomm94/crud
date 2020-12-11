import base from './base'
import schedule from './schedule'
import Router from 'koa-router'

const router = new Router()

router.use('/', base.routes(), base.allowedMethods())
router.use('/schedule', schedule.routes(), schedule.allowedMethods())

export {
    router
}
