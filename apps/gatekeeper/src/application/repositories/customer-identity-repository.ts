import { Customer } from "@gatekeeper/application/entities/customer";

export abstract class CustomerIdentityRepository {
  abstract create(customer: Customer): Promise<void>;
  abstract findByEmail(email: string): Promise<Customer | null>;
  abstract findById(id: string): Promise<Customer | null>;
  abstract signIn(
    email: string,
    password: string,
  ): Promise<{ token: string; customerId: string | null }>;
  abstract validate(token: string): Promise<string | null>;
}
