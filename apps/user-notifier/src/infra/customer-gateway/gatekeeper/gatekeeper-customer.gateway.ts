import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  CustomerData,
  CustomerGateway,
} from "@user-notifier/application/customer-gateway/customer-gateway";

@Injectable()
export class GatekeeperCustomerGateway implements CustomerGateway {
  private readonly logger = new Logger(GatekeeperCustomerGateway.name);
  private readonly baseUrl =
    process.env.GATEKEEPER_URL ?? "http://gatekeeper";

  constructor(private readonly httpService: HttpService) {}

  async getById(customerId: string): Promise<CustomerData> {
    this.logger.debug(
      `Fetching customer ${customerId} from gatekeeper, URL: ${this.baseUrl}/customers/${customerId}`,
    );

    const { data } = await firstValueFrom(
      this.httpService.get<CustomerData>(
        `${this.baseUrl}/customers/${customerId}`,
        {
          headers: {
            "X-Internal-Api-Key": process.env.INTERNAL_SERVICE_API_KEY ?? "",
          },
        },
      ),
    );

    return data;
  }
}
