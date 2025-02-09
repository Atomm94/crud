// import overrideValidator from './middleware/validation'
import responseHandler from './middleware/responseHandler'
import errorHandler from './middleware/errorHandler'
import requestId from './middleware/requestId'
import logging from './middleware/logging'
import options from './middleware/options'
import checkJwt from './middleware/checkJwt'
// import addNameToRoute from './middleware/addNameToRoute'
// import checkRole from './middleware/checkRole'

import { join } from 'path'

import { config, checkOriginWhiteList } from '../config'
import { router } from './router'
// import sentry from '../component/sentry';
// import { getLogLevelForStatus } from '../lib/logger';

import compress from 'koa-compress'
// import bodyParser from 'koa-bodyparser'

// import helmet from 'koa-helmet'
import cors from 'koa2-cors'

import Koa from 'koa'
import clickhouselog from './middleware/clickhouselog'
// import bodyParser from 'koa-bodyparser'
// console.log(checkRole)
// import resource from './middleware/resource'

const koaBody = require('koa-body')
const parentDir = join(__dirname, '../')
const serve = require('koa-static')

// const responseTime = require('koa-response-time')
// const validator = require('node-input-validator')
const swaggerUi = require('swagger-ui-koa')

const app: Koa = new Koa()
require('koa-qs')(app)

process.setMaxListeners(0)
// centralized error handling
// app.on('error', (err: Error, ctx: Koa.DefaultContext): void => {

// })
// Console debug logging
app.use(logging())

// Validation middleware -> adds ctx.validate
// app.use(validator.koa())

// app.use(overrideValidator())

// Provides important security headers to make your app more secure
// app.use(helmet())

// Enable cors with default options
app.use(cors({ ...config.cors, origin: checkOriginWhiteList }))

// Enable bodyParser with default options
// app.use(bodyParser(config.bodyParser))
// app.use(addNameToRoute(router))
app.use(koaBody(
    {
        multipart: true,
        // json: true,
        // text: true,
        jsonLimit: '10mb',
        formLimit: '10mb',
        formidable: { uploadDir: `${parentDir}/public/tmp` },
        parsedMethods: ['POST', 'PUT', 'DELETE']
    }
))

// serve files from ./public

app.use(serve(`${parentDir}/public`))

// Adds an X-Request-Id response header with a unique request ID value
app.use(requestId())

// Adds an X-Response-Time header with a query execution time value
// app.use(responseTime())

// Check Jwt Middleware

app.use(checkJwt())
// app.use(checkRole())

// handler
app.use(responseHandler())
app.use(errorHandler())

app.use(swaggerUi.serve)

app.use(compress())
app.use(options())

// app.use(cacheResponse(60))
app.use(clickhouselog())
// app.use(resource())
// routers
app.use(router.routes()).use(router.allowedMethods())

export default app
