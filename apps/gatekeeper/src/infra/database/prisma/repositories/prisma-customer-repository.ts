// infra/database/customer-prisma-repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerDataRepository } from "@gatekeeper/application/repositories/customer-data-repository";

@Injectable()
export class CustomerPrismaRepository implements CustomerDataRepository {
  constructor(private prisma: PrismaService) {}

  async create(customer: Customer): Promise<void> {
    await this.prisma.customer.create({
      data: {
        id: customer.id, // sub do Cognito
        cpf: customer.cpf,
        name: customer.name,
        email: customer.email,
      },
    });
  }

  async findByCpf(cpf: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { cpf },
    });

    if (!record) return null;

    return new Customer(
      {
        ...record,
        email: record.email ?? undefined,
      },
      record.id,
    );
  }

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!record) return null;

    return new Customer(
      {
        ...record,
        email: record.email ?? undefined,
      },
      record.id,
    );
  }
}
