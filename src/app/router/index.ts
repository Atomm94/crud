import base from './base'
import schedule from './schedule'
import admin from './admin'
import role from './role'
import packet from './packet'
import packetType from './packetType'
import accessRight from './accessRight'
import accountGroup from './accountGroup'
import cardholder from './cardholder'
import cardholdersGroup from './cardholdersGroup'
import company from './company'
import department from './department'
import accessPoint from './accessPoint'
import accessPointGroup from './accessPointGroup'
import accessPointZone from './accessPointZone'
import ticket from './ticket'

import Router from 'koa-router'

const router = new Router()

router.use('/', base.routes(), base.allowedMethods())
router.use('/', schedule.routes(), schedule.allowedMethods())
router.use('/', admin.routes(), admin.allowedMethods())
router.use('/', role.routes(), role.allowedMethods())
router.use('/', packet.routes(), packet.allowedMethods())
router.use('/', packetType.routes(), packetType.allowedMethods())
router.use('/', accessRight.routes(), accessRight.allowedMethods())
router.use('/', accountGroup.routes(), accountGroup.allowedMethods())
router.use('/', cardholder.routes(), cardholder.allowedMethods())
router.use('/', cardholdersGroup.routes(), cardholdersGroup.allowedMethods())
router.use('/', company.routes(), company.allowedMethods())
router.use('/', department.routes(), department.allowedMethods())
router.use('/', ticket.routes(), ticket.allowedMethods())
router.use('/', accessPoint.routes(), accessPoint.allowedMethods())
router.use('/', accessPointGroup.routes(), accessPointGroup.allowedMethods())
router.use('/', accessPointZone.routes(), accessPointZone.allowedMethods())

export {
    router
}
