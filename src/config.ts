import * as dotenv from 'dotenv'
import * as path from 'path'
import * as _ from 'lodash'
import { DefaultContext } from 'koa'
import { IClientOptions } from 'mqtt'
import uuid from 'uuid'

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' })

const allowEnv: string[] = ['development', 'test', 'production']

process.env.NODE_ENV = process.env.NODE_ENV && allowEnv.includes((process.env.NODE_ENV).toLocaleLowerCase())
    ? (process.env.NODE_ENV).toLocaleLowerCase() : 'development'

const ROOT = path.resolve(__dirname, '../')

export interface IConfig {
    server: {
        port: number | boolean,
        root: string
    };
    mqtt: IClientOptions;
    db: {
        type: string,
        user: string,
        pass: string,
        host: string,
        port: number | boolean,
        cache: number | string,
        name: string,
        dbsslconn: boolean,
        synchronize: boolean,
    };
    cors: {
        origin: string,
        credentials: boolean
        allowMethods: string[],
        exposeHeaders: string[],
        allowHeaders: string[]
    };
    bodyParser: {
        enableTypes: string[],
        formLimit: string,
        jsonLimit: string
    };
    logger: {
        sentry: {
            dns: string
        }
    };
    cctv: {
        transType: number,
        transProtocol: number
    }
    sendgrid: {
        fromEmail: object,
        apiKey: string
    };
    zoho: {
        client_id: string,
        client_secret: string,
        code: string,
        scope: string,
        redirect_uri: string,
        product_id: string,
        organization_id: string,
        access_token: string,
        refresh_token: string,
        token_expire_time: string,
        urls: {
            tokenFromRefreshTokenUrl: string,
            createPlanUrl: string,
            createCustomerUrl: string,
            createSubscriptionUrl: string
        }
    };
    redis: {
        host: string,
        port: string,
        password: string,
        db: string,
        username: string
    }
    cluster: {
        qty: string,
    },
    nodeEnv: string;
    isTest: boolean;
    isProduction: boolean;
    isDevelopment: boolean;
    publicPath: string;

}

var config: IConfig = {
    server: {
        port: normalizePort(_.defaultTo(process.env.PORT, 3000)),
        root: ROOT
    },
    cluster: {
        qty: _.defaultTo(process.env.CLUSTERS_QTY, '0')
    },
    mqtt: {
        protocol: _.defaultTo(process.env.MQTT_PROTOCOL, 'wxs') as 'wss' | 'ws' | 'mqtt' | 'mqtts' | 'tcp' | 'ssl' | 'wx' | 'wxs',
        host: _.defaultTo(process.env.MQTT_HOST, 'localhost'),
        port: normalizePort(_.defaultTo(process.env.MQTT_PORT, 5432)) as number,
        username: _.defaultTo(process.env.MQTT_USERNAME, 'unimacs'),
        password: _.defaultTo(process.env.MQTT_PASSWORD, '123456'),
        clientId: uuid.v4(),
        clean: false
    },
    db: {
        type: _.defaultTo(process.env.DB_TYPE, 'mysql'),
        user: _.defaultTo(process.env.DB_USER, 'postgres'),
        pass: _.defaultTo(process.env.DB_PASS, 'postgres'),
        host: _.defaultTo(process.env.DB_HOST, 'localhost'),
        port: normalizePort(_.defaultTo(process.env.DB_PORT, 5432)),
        name: _.defaultTo(process.env.DB_NAME, 'postgres'),
        cache: _.defaultTo(process.env.DB_CACHE, 60000),
        dbsslconn: process.env.NODE_ENV === 'production',
        synchronize: _.defaultTo(JSON.parse(process.env.DB_SYNC as string), false)
    },
    cors: {
        origin: process.env.ORIGIN ? process.env.ORIGIN : 'http://localhost:8080',
        credentials: true,
        allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
        exposeHeaders: ['X-Request-Id'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept']
    },
    bodyParser: {
        enableTypes: ['json', 'form'],
        formLimit: '10mb',
        jsonLimit: '10mb'
    },
    logger: {
        sentry: {
            dns: process.env.SENTRY_DNS as string
        }
    },
    cctv: {
        transType: 0,
        transProtocol: 1
    },
    sendgrid: {
        fromEmail: {
            email: _.defaultTo(process.env.SENDGRID_FROM_EMAIL, 'support@lumiring.com'),
            name: _.defaultTo(process.env.SENDGRID_FROM_EMAIL_NAME, 'Lumiring Inc')
        },
        apiKey: _.defaultTo(process.env.SENDGRID_API_KEY, 'empty')
    },
    zoho: {
        client_id: '',
        client_secret: '',
        code: '',
        scope: '',
        redirect_uri: '',
        product_id: _.defaultTo(process.env.PRODUCT_ID, '2857260000000093003'),
        organization_id: _.defaultTo(process.env.ORGANIZATION_ID, '762669996'),
        access_token: '',
        refresh_token: '',
        token_expire_time: '',
        urls: {
            tokenFromRefreshTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
            createPlanUrl: 'https://subscriptions.zoho.com/api/v1/plans',
            createCustomerUrl: 'https://subscriptions.zoho.com/api/v1/customers',
            createSubscriptionUrl: 'https://subscriptions.zoho.com/api/v1/subscriptions'
        }

    },
    redis: {
        host: _.defaultTo(process.env.REDIS_HOST, 'localhost'),
        port: _.defaultTo(process.env.REDIS_PORT, '6379'),
        password: _.defaultTo(process.env.REDIS_PASSWORD, '123456'),
        db: _.defaultTo(process.env.REDIS_DB, '0'),
        username: _.defaultTo(process.env.REDIS_USERNAME, 'default')
    },
    nodeEnv: process.env.NODE_ENV,
    isTest: !!(process.env.NODE_ENV === 'test' && process.env.NODE_TEST),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    publicPath: _.defaultTo(process.env.PUBLIC_PATH, 'src/public')
}

/**
 * Normalize port
 * @param val {string} value port
 */
export function normalizePort(val: string | number): number | boolean {
    const port: number = parseInt(val as string, 10)

    if (isNaN(port)) {
        return port
    }

    if (port >= 0) {
        return port
    }

    return false
}

const whitelist = _.defaultTo(JSON.parse(process.env.ORIGIN as string), ['http://localhost:8080'])
export function checkOriginWhiteList(ctx: DefaultContext) {
    const requestOrigin = ctx.accept.headers.origin
    if (!whitelist.includes('*') && !whitelist.includes(requestOrigin)) {
        return false
    }
    return requestOrigin
}

export { config }
