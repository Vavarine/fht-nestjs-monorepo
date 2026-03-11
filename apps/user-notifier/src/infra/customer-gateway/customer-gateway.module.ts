import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { CustomerGateway } from "@user-notifier/application/customer-gateway/customer-gateway";
import { GatekeeperCustomerGateway } from "./gatekeeper/gatekeeper-customer.gateway";

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: CustomerGateway,
      useClass: GatekeeperCustomerGateway,
    },
  ],
  exports: [CustomerGateway],
})
export class CustomerGatewayModule {}
