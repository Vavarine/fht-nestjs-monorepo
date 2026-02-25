import { Customer } from "@gatekeeper/application/entities/customer";

export abstract class CustomerIdentityRepository {
  abstract create(customer: Customer): Promise<void>;
  abstract findByCpf(cpf: string): Promise<Customer | null>;
}
