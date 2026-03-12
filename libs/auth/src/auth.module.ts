import { Module } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { AuthGuard } from "./guards/auth.guard";
import { AuthService } from "./application/auth-service";
import { CognitoAuthService } from "./infra/cognito/cognito-auth.service";

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: AuthService,
      useClass: CognitoAuthService,
    },
    Reflector,
  ],
})
export class AuthModule {}
