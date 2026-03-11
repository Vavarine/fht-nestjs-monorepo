import { CacheModule } from "@nestjs/cache-manager";
import KeyvRedis from "@keyv/redis";

export const RedisCacheModule = CacheModule.registerAsync({
  useFactory: async () => {
    return {
      ttl: 500,
      stores: [
        new KeyvRedis(process.env.REDIS_URL || "redis://localhost:6379"),
      ],
    };
  },
});
