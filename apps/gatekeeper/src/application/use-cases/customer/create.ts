import { Customer } from "@gatekeeper/application/entities/customer";
import { Injectable } from "@nestjs/common";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import { CustomerAlreadyExistsError } from "@gatekeeper/application/errors/customer-error";

export interface CreateCustomerRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateCustomerResponse {
  customerId: string;
}

@Injectable()
export class CreateCustomer {
  constructor(
    private readonly customerIdentityRepository: CustomerIdentityRepository,
  ) {}

  async execute(
    request: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const { name, email, password } = request;

    let customer;

    customer = await this.customerIdentityRepository.findByEmail(email);

    if (customer) {
      throw new CustomerAlreadyExistsError();
    }

    customer = new Customer({ name, email, password });
    await this.customerIdentityRepository.create(customer);

    return { customerId: customer.id };
  }
}
