import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";

export class InMemoryCustomersRepository extends CustomerIdentityRepository {
  public items: Customer[] = [];

  async create(customer: Customer): Promise<void> {
    this.items.push(customer);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.items.find((item) => item.email === email) ?? null;
  }

  async findById(id: string): Promise<Customer | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async signIn(
    _email: string,
    _password: string,
  ): Promise<{ token: string; customerId: string | null }> {
    throw new Error("signIn not implemented in InMemoryCustomersRepository");
  }

  async validate(_token: string): Promise<string | null> {
    throw new Error("validate not implemented in InMemoryCustomersRepository");
  }
}
