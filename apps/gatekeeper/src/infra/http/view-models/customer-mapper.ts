import { Customer } from "@gatekeeper/application/entities/customer";
export class CustomerMapper {
  static toHTTP(customer: Customer) {
    return {
      id: customer.id,
      name: customer.name,
      cpf: customer.cpf,
      email: customer.email,
      createdAt: customer.createdAt,
    };
  }
}
