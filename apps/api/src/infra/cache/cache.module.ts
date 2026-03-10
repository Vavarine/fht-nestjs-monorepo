import { Module } from "@nestjs/common";
import { RedisCacheModule } from "./redis/redis-cache.service";

@Module({
  imports: [RedisCacheModule],
  exports: [RedisCacheModule],
})
export class AppCacheModule {}
