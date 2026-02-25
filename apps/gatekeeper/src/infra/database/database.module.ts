import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { CustomerDataRepository } from "../../application/repositories/customer-data-repository";
import { CustomerPrismaRepository } from "./prisma/repositories/prisma-customer-repository";

@Module({
  providers: [
    PrismaService,

    {
      provide: CustomerDataRepository,
      useClass: CustomerPrismaRepository,
    },
  ],
  exports: [CustomerDataRepository, PrismaService],
})
export class DatabaseModule {}
