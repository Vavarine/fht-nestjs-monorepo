import { Customer } from "@gatekeeper/application/entities/customer";

export class PrismaCustomerMapper {
  static toPrisma(customer: Customer) {
    return {
      id: customer.id,
      cpf: customer.cpf,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
    };
  }

  static toDomain(raw: any): Customer {
    return new Customer(
      {
        cpf: raw.cpf,
        name: raw.name,
        email: raw.email,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }
}
