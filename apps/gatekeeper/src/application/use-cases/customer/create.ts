import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerDataRepository } from "@gatekeeper/application/repositories/customer-data-repository";
import { Injectable } from "@nestjs/common";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import { CustomerAlreadyExistsError } from "@gatekeeper/application/errors/customer-error";

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  cpf: string;
}

export interface CreateCustomerResponse {
  customerId: string;
}

@Injectable()
export class CreateCustomer {
  constructor(
    private readonly customerIdentityRepository: CustomerIdentityRepository,
    private readonly customerDataRepository: CustomerDataRepository,
  ) {}

  async execute(
    request: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const { cpf, name, email } = request;

    // 1. Verifica no banco
    let customer = await this.customerDataRepository.findByCpf(cpf);

    // Se existe no banco, retorna erro
    if (customer) {
      throw new CustomerAlreadyExistsError();
    }

    // 2. Se não tem no banco, verifica no Cognito
    customer = await this.customerIdentityRepository.findByCpf(cpf);

    // Se existe no Cognito, retorna erro (já que não está sincronizado, é uma situação anômala)
    if (customer) {
      throw new CustomerAlreadyExistsError();
    }

    // 3. Se não existe em nenhum lugar → cria
    customer = new Customer({ cpf, name, email });
    await this.customerIdentityRepository.create(customer);

    // Re-busca para pegar o sub (com retries por causa do delay de propagação do Cognito)
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      // Pequeno delay entre tentativas
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      customer = await this.customerIdentityRepository.findByCpf(cpf);

      if (customer) {
        // 4. Sincroniza no banco
        await this.customerDataRepository.create(customer);
        return { customerId: customer.id };
      }

      retries++;
    }

    // Se chegou aqui é porque não conseguiu encontrar o usuário após várias tentativas
    throw new Error(
      "Failed to retrieve created customer from Cognito after multiple attempts",
    );
  }
}
