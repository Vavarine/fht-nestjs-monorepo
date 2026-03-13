import { CreateCustomer } from "@gatekeeper/application/use-cases/customer/create";
import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { CreateCustomerBody } from "../dtos/customer-dtos";
import { GetCustomerById } from "@gatekeeper/application/use-cases/customer/get-by-id";
import { CustomerMapper } from "../view-models/customer-mapper";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

import {
  CustomerAlreadyExistsError,
  CustomerNotFound,
} from "@gatekeeper/application/errors/customer-error";
import { Public } from "@auth";

@Controller("customers")
export class CustomersController {
  constructor(
    private createCustomer: CreateCustomer,
    private getCustomerById: GetCustomerById,
  ) {}

  @ApiOperation({
    summary: "Criar cliente",
    description: "Cria um novo cliente.",
  })
  @Public()
  @Post()
  async create(@Body() body: CreateCustomerBody) {
    try {
      await this.createCustomer.execute(body);
      return { message: "Customer created successfully" };
    } catch (error) {
      if (error instanceof CustomerAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: "Buscar cliente por ID",
    description: "Retorna os dados de um cliente específico pelo ID.",
  })
  @ApiBearerAuth("jwt")
  @Get(":id")
  async getById(@Param("id") id: string) {
    try {
      const { customer } = await this.getCustomerById.execute({
        customerId: id,
      });
      return CustomerMapper.toHTTP(customer);
    } catch (error) {
      if (error instanceof CustomerNotFound) {
        throw new NotFoundException("Customer not found");
      }
      throw error;
    }
  }
}
