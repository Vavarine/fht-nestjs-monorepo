import { Module } from "@nestjs/common";
import { AWSLambdaAuth } from "./aws-lambda/aws-lamda";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { AuthGuard } from "./guards/auth.guard";
import { AuthService } from "../../application/auth-service/auth-service";

@Module({
  providers: [
    {
      provide: AuthService,
      useClass: AWSLambdaAuth,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    Reflector,
  ],
  exports: [AuthService],
})
export class AuthModule {}
