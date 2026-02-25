import { Injectable } from "@nestjs/common";
import { CustomerDataRepository } from "@gatekeeper/application/repositories/customer-data-repository";
import { CustomerNotFound } from "../../errors/customer-error";
import { Customer } from "@gatekeeper/application/entities/customer";

interface GetCustomerByIdRequest {
  customerId: string;
}

interface GetCustomerByIdResponse {
  customer: Customer;
}

@Injectable()
export class GetCustomerById {
  constructor(private customerDataRepository: CustomerDataRepository) {}

  async execute(
    request: GetCustomerByIdRequest,
  ): Promise<GetCustomerByIdResponse> {
    const { customerId } = request;

    const customer = await this.customerDataRepository.findById(customerId);

    if (!customer) {
      throw new CustomerNotFound(customerId);
    }

    return { customer };
  }
}
