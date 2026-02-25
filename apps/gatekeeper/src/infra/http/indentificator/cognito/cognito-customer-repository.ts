// infra/database/cognito/cognito-customer-repository.ts
import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CognitoCustomerRepository implements CustomerIdentityRepository {
  private client = new CognitoIdentityProviderClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN!,
    },
  });

  private userPoolId = process.env.USER_POOL_ID!;
  private readonly logger = new Logger(CognitoCustomerRepository.name);

  async findByCpf(cpf: string): Promise<Customer | null> {
    this.logger.log(`[START] Searching user in Cognito - CPF: ${cpf}`);
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: `username = "${cpf}"`,
        Limit: 1,
      });

      const result = await this.client.send(command);
      const user = result.Users?.[0];

      if (!user) {
        this.logger.log(
          `[NOT FOUND] No user found in Cognito with CPF: ${cpf}`,
        );
        return null;
      }

      // Pega o "sub" do usuário
      const subAttr = user.Attributes?.find((attr) => attr.Name === "sub");
      const nameAttr = user.Attributes?.find((attr) => attr.Name === "name");
      const emailAttr = user.Attributes?.find((attr) => attr.Name === "email");

      const customer = new Customer(
        {
          name: nameAttr?.Value ?? "",
          email: emailAttr?.Value ?? "",
          cpf,
        },
        subAttr?.Value!, // Agora o customer.id é o sub
      );

      this.logger.log(`[FOUND] Cognito user retrieved - sub: ${customer.id}`);

      return customer;
    } catch (error: any) {
      this.logger.error(
        `[ERROR] Failed to find user in Cognito - CPF: ${cpf}`,
        {
          error: error.message,
          code: error.code,
          requestId: error.$metadata?.requestId,
          stack: error.stack,
        },
      );
      throw error;
    }
  }

  async create(customer: Customer): Promise<void> {
    try {
      this.logger.log(
        `[START] Creating user in Cognito - CPF: ${customer.cpf}`,
      );
      this.logger.debug(`UserPool ID: ${this.userPoolId}`);

      if (!this.userPoolId) {
        throw new Error("USER_POOL_ID not configured");
      }

      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: customer.cpf,
        UserAttributes: [
          { Name: "name", Value: customer.name },
          { Name: "email", Value: customer.email },
        ],
        MessageAction: "SUPPRESS", // Não envia email
      });

      this.logger.debug("Sending command to Cognito");
      await this.client.send(command);
      this.logger.log(
        `[SUCCESS] User created in Cognito - CPF: ${customer.cpf}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[ERROR] Failed to create user in Cognito - CPF: ${customer.cpf}`,
        {
          error: error.message,
          code: error.code,
          requestId: error.$metadata?.requestId,
          stack: error.stack,
        },
      );
      throw error;
    }
  }
}
