import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { CustomerDataRepository } from "../../application/repositories/customer-data-repository";
import { CustomerPrismaRepository } from "./prisma/repositories/prisma-customer-repository";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import { CognitoCustomerRepository } from "../http/indentificator/cognito/cognito-customer-repository";

@Module({
  providers: [
    PrismaService,
    {
      provide: CustomerIdentityRepository,
      useClass: CognitoCustomerRepository,
    },
    {
      provide: CustomerDataRepository,
      useClass: CustomerPrismaRepository,
    },
  ],
  exports: [CustomerDataRepository, CustomerIdentityRepository, PrismaService],
})
export class DatabaseModule {}
