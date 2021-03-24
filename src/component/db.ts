import 'reflect-metadata'
import { createConnection, Connection, ConnectionOptions } from 'typeorm'
import { join } from 'path'
import { config } from '../config'
const parentDir = join(__dirname, '..')

const connectionOpts: ConnectionOptions = {
  type: config.db.type as 'postgres',
  host: config.db.host,
  port: config.db.port as number,
  username: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  entities: [`${parentDir}/app/model/entity/*{.ts,.js}`],
  migrations: [`${parentDir}/app/model/migration/*{.ts,.js}`],
  subscribers: [`${parentDir}/app/model/subscriber/*{.ts,.js}`],
  cli: {
    entitiesDir: `${parentDir}/app/model/entity`,
    migrationsDir: `${parentDir}/app/model/migration`,
    subscribersDir: `${parentDir}/app/model/subscriber`
  },
  synchronize: config.db.synchronize,
  logging: false,
  extra: {
    ssl: config.db.dbsslconn // if not development, will use SSL
  }
}

interface IDatabase {
  connect(): Promise<Connection>;
  disconnect(): Promise<void>;
  executeSQL(sql: string, ...params: any[]): Promise<any>;
  reset(): any;
}

export class Database implements IDatabase {
  private connection: Connection;
  public async connect (): Promise<Connection> {
    if (this.connection) {
      await this.connection.connect()
      return this.connection
    }
    this.connection = await createConnection(connectionOpts)
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
