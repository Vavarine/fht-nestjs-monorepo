import { Module } from "@nestjs/common";
// import { DatabaseModule } from "../database/database.module";
import { AuthController } from "./controllers/auth.controller";
import { CustomersController } from "./controllers/customer.controller";
import { GetCustomerByCpf } from "@gatekeeper/application/use-cases/customer/get-by-cpf";

import { GetCustomerById } from "@gatekeeper/application/use-cases/customer/get-by-id";
import { CreateCustomer } from "@gatekeeper/application/use-cases/customer/create";
import { AuthModule } from "../auth/auth.module";

const customerUseCases = [CreateCustomer, GetCustomerByCpf, GetCustomerById];

@Module({
  imports: [
    // DatabaseModule,
    AuthModule,
  ],
  controllers: [AuthController, CustomersController],
  providers: [...customerUseCases],
})
export class HttpModule {}
