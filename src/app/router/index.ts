import base from './base'
import schedule from './schedule'
import admin from './admin'
import role from './role'
import package_api from './package'
import packageType from './packageType'
import accessRight from './accessRight'
import accountGroup from './accountGroup'
import cardholder from './cardholder'
import cardholdersGroup from './cardholdersGroup'
import company from './company'
import department from './department'
import accessPoint from './accessPoint'
import accessPointGroup from './accessPointGroup'
import accessPointZone from './accessPointZone'
import acu from './acu'
import ticket from './ticket'
import credential from './credential'
import standardReport from './standardReport'
import cameraDevice from './cameraDevice'
import cameraSet from './cameraSet'

import Router from 'koa-router'
import extDevice from './extDevice'
import autoTaskSchedule from './autoTaskSchedule'
import dashboard from './dashboard'
import notification from './notification'
import zoho from './zoho'

const router = new Router()

router.use('/', base.routes(), base.allowedMethods())
router.use('/', schedule.routes(), schedule.allowedMethods())
router.use('/', admin.routes(), admin.allowedMethods())
router.use('/', role.routes(), role.allowedMethods())
router.use('/', package_api.routes(), package_api.allowedMethods())
router.use('/', packageType.routes(), packageType.allowedMethods())
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
router.use('/', acu.routes(), acu.allowedMethods())
router.use('/', extDevice.routes(), extDevice.allowedMethods())
router.use('/', autoTaskSchedule.routes(), autoTaskSchedule.allowedMethods())
router.use('/', credential.routes(), credential.allowedMethods())
router.use('/', standardReport.routes(), standardReport.allowedMethods())
router.use('/', dashboard.routes(), dashboard.allowedMethods())
router.use('/', notification.routes(), notification.allowedMethods())
router.use('/', zoho.routes(), zoho.allowedMethods())
router.use('/', cameraDevice.routes(), cameraDevice.allowedMethods())
router.use('/', cameraSet.routes(), cameraSet.allowedMethods())

export {
    router
}
