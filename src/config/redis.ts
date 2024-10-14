import {
  RedisClientOptions, RedisFunctions, RedisScripts, RedisModules
} from 'redis';

export const redisConfig = {
  host: process.env.AAA_REDIS_HOST,
  port: process.env.AAA_REDIS_PORT,
  database: process.env.AAA_REDIS_DATABASE,
  password: process.env.AAA_REDIS_PASSWORD
} as RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
