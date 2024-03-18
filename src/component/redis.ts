
import { Redis } from 'ioredis'
import { config } from '../config'
export class RedisClass {
  static connection: any;
  public static connect () {
    // const connectionOpts = {
    //   host: 'redis',
    //   port: 6379,
    //   password: '123456'
    // }
    this.connection = new Redis({
      host: config.redis.host,
      port: Number(config.redis.port),
      password: config.redis.password,
      username: config.redis.username,
      db: Number(config.redis.db)
    })
    return this.connection
  }
}
