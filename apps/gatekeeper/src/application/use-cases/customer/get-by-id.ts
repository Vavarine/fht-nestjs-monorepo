import { Injectable } from "@nestjs/common";
import { CustomerNotFound } from "../../errors/customer-error";
import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";

interface GetCustomerByIdRequest {
  customerId: string;
}

interface GetCustomerByIdResponse {
  customer: Customer;
}

@Injectable()
export class GetCustomerById {
  constructor(
    private readonly customerIdentityRepository: CustomerIdentityRepository,
  ) {}

  async execute(
    request: GetCustomerByIdRequest,
  ): Promise<GetCustomerByIdResponse> {
    const { customerId } = request;

    // TODO fix
    const customer = await this.customerIdentityRepository.findById(customerId);

    // await this.customerDataRepository.findById(customerId);

    if (!customer) {
      throw new CustomerNotFound(customerId);
    }

    return { customer };
  }
}
