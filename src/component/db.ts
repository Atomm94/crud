import 'reflect-metadata'
import { join } from 'path'
import { config } from '../config'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { DataSource } from 'typeorm'
const parentDir = join(__dirname, '..')

const connectionOpts: MysqlConnectionOptions = {
  type: config.db.type as 'mysql',
  host: config.db.host,
  port: config.db.port as number,
  username: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  // cache: true,
  cache: {
    type: 'ioredis',
    options: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      username: config.redis.username,
      db: Number(config.redis.db)
    }
  },
  entities: [`${parentDir}/app/model/entity/*{.ts,.js}`],
  migrations: [`${parentDir}/app/model/migration/*{.ts,.js}`],
  subscribers: [`${parentDir}/app/model/subscriber/*{.ts,.js}`],
  // cli: {
  //   entitiesDir: `${parentDir}/app/model/entity`,
  //   migrationsDir: `${parentDir}/app/model/migration`,
  //   subscribersDir: `${parentDir}/app/model/subscriber`
  // },
  synchronize: config.db.synchronize,
  logging: false,
  extra: {
    connectionLimit: process.env.ORM_CONNECTION_LIMIT
  }
}

interface IDatabase {
  connect(): Promise<any>;
  disconnect(): Promise<void>;
  executeSQL(sql: string, ...params: any[]): Promise<any>;
  reset(): any;
}

export class Database implements IDatabase {
  private connection: DataSource;
  public async connect (): Promise<any> {
    if (this.connection) {
      await this.connection.initialize()
      return this.connection
    }
    try {
      this.connection = await new DataSource(connectionOpts).initialize()
    } catch (error) {
      console.log('error', error)
    }
    return this.connection
  }

  public async disconnect (): Promise<void> {
    if (this.connection.isConnected) {
      await this.connection.close()
    }
  }

  public async executeSQL (sql: string, ...params: any[]): Promise<any> {
    return this.connection.createQueryRunner().query(sql, params)
  }

  public async reset () {
    await this.connection.dropDatabase()
    await this.connection.runMigrations()
  }

  public async runMigrations () {
    await this.connection.runMigrations()
  }

  public async dropDatabase () {
    await this.connection.dropDatabase()
  }
}
