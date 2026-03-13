import { Module } from "@nestjs/common";

import { AuthController } from "./controllers/auth.controller";
import { CustomersController } from "./controllers/customer.controller";

import { GetCustomerById } from "@gatekeeper/application/use-cases/customer/get-by-id";
import { CreateCustomer } from "@gatekeeper/application/use-cases/customer/create";
import { AuthModule } from "../auth/auth.module";
import { IdentifierModule } from "./indentificator/identificator.module";

const customerUseCases = [CreateCustomer, GetCustomerById];

@Module({
  imports: [IdentifierModule, AuthModule],
  controllers: [AuthController, CustomersController],
  providers: [...customerUseCases],
})
export class HttpModule {}
