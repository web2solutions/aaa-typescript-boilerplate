import {
  RedisClientOptions, RedisFunctions, RedisScripts, RedisModules
} from 'redis';

export const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  database: 7,
  password: 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81'
} as RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;
