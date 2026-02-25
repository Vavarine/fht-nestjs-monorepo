import { Module } from "@nestjs/common";
import { CognitoCustomerRepository } from "../indentificator/cognito/cognito-customer-repository";

import { CustomerIdentityRepository } from "../../../application/repositories/customer-identity-repository";

@Module({
  providers: [
    {
      provide: CustomerIdentityRepository,
      useClass: CognitoCustomerRepository,
    },
  ],
  exports: [CustomerIdentityRepository],
})
export class DatabaseModule {}
