import config from './src/config'
import { join } from 'path'
const parentDir = join(__dirname, '')

export = {
  type: config.db.type as 'mongodb',
  host: config.db.host,
  port: config.db.port as number,
  username: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  entities: [`${parentDir}/src/app/model/entity/*{.ts,.js}`],
  migrations: [`${parentDir}/src/app/model/migration/*{.ts,.js}`],
  subscribers: [`${parentDir}/src/app/model/subscriber/*{.ts,.js}`],
  cli: {
    entitiesDir: `${parentDir}/src/app/model/entity`,
    migrationsDir: `${parentDir}/src/app/model/migration`,
    subscribersDir: `${parentDir}/src/app/model/subscriber`
  },
  synchronize: config.db.synchronize,
  logging: false,
  extra: {
    ssl: config.db.dbsslconn // if not development, will use SSL
  }
};
