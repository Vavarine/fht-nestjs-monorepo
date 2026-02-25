import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerDataRepository } from "@gatekeeper/application/repositories/customer-data-repository";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import { Injectable, NotFoundException } from "@nestjs/common";

interface GetCustomerByCpfRequest {
  cpf: string;
}

@Injectable()
export class GetCustomerByCpf {
  constructor(
    private readonly customerDataRepository: CustomerDataRepository,
    private readonly customerIdentityRepository: CustomerIdentityRepository,
  ) {}

  async execute(cpf: string): Promise<Customer | null> {
    // Limpa espaços do CPF
    const cleanCpf = cpf.trim();

    // Primeiro tenta no banco
    let customer = await this.customerDataRepository.findByCpf(cleanCpf);

    if (!customer) {
      // Se não achou, tenta no Cognito
      customer = await this.customerIdentityRepository.findByCpf(cleanCpf);

      // IMPORTANTE: Não devemos criar no banco aqui, pois isso causaria inconsistência
      // Se o cliente existe no Cognito mas não no banco, algo está errado
      // e devemos informar isso
      if (customer) {
        throw new Error(
          `Customer exists in Cognito but not in database. This is an inconsistent state. Please contact support.`,
        );
      }
    }

    if (!customer) {
      throw new NotFoundException(`Customer with CPF ${cleanCpf} not found`);
    }

    return customer;
  }
}
