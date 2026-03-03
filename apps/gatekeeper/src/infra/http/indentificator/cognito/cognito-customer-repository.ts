// infra/database/cognito/cognito-customer-repository.ts
import { Customer } from "@gatekeeper/application/entities/customer";
import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  InitiateAuthCommand,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CognitoCustomerRepository implements CustomerIdentityRepository {
  private client = new CognitoIdentityProviderClient({
    endpoint: process.env.COGNITO_ENDPOINT_URL, // Para testes locais com LocalStack
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      // sessionToken: process.env.AWS_SESSION_TOKEN!,
    },
  });

  private userPoolId = process.env.USER_POOL_ID!;
  private clientId = process.env.COGNITO_APP_CLIENT_ID!;
  private readonly logger = new Logger(CognitoCustomerRepository.name);

  async findByEmail(email: string): Promise<Customer | null> {
    this.logger.log(`[START] Searching user in Cognito - Email: ${email}`);
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      });

      const result = await this.client.send(command);
      const user = result.Users?.[0];

      if (!user) {
        this.logger.log(
          `[NOT FOUND] No user found in Cognito with Email: ${email}`,
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
        },
        subAttr?.Value!, // Agora o customer.id é o sub
      );

      this.logger.log(`[FOUND] Cognito user retrieved - sub: ${customer.id}`);

      return customer;
    } catch (error: any) {
      this.logger.error(
        `[ERROR] Failed to find user in Cognito - Email: ${email}`,
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
        `[START] Creating user in Cognito - Email: ${customer.email}`,
      );

      if (!this.clientId) {
        throw new Error("COGNITO_APP_CLIENT_ID not configured");
      }

      await this.client.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: customer.email,
          Password: customer.password,
          UserAttributes: [
            { Name: "name", Value: customer.name },
            { Name: "email", Value: customer.email },
          ],
        }),
      );

      await this.client.send(
        new AdminConfirmSignUpCommand({
          UserPoolId: this.userPoolId,
          Username: customer.email,
        }),
      );

      this.logger.log(
        `[SUCCESS] User created and confirmed in Cognito - Email: ${customer.email}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[ERROR] Failed to create user in Cognito - Email: ${customer.email}`,
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

  async validate(token: string): Promise<string | null> {
    this.logger.log(`[START] Validating token with Cognito`);
    try {
      const result = await this.client.send(
        new GetUserCommand({ AccessToken: token }),
      );
      const sub =
        result.UserAttributes?.find((a) => a.Name === "sub")?.Value ?? null;
      this.logger.log(`[SUCCESS] Token valid - sub: ${sub}`);
      return sub;
    } catch (error: any) {
      this.logger.error(`[ERROR] Token validation failed`, {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ token: string; customerId: string | null }> {
    this.logger.log(`[START] Signing in user in Cognito - Email: ${email}`);
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const result = await this.client.send(command);
      const accessToken = result.AuthenticationResult?.AccessToken;

      if (!accessToken) {
        throw new Error("No access token returned from Cognito");
      }

      const payload = JSON.parse(
        Buffer.from(accessToken.split(".")[1], "base64").toString(),
      );
      const customerId: string | null = payload.sub ?? null;

      this.logger.log(`[SUCCESS] User signed in - customerId: ${customerId}`);

      return { token: accessToken, customerId };
    } catch (error: any) {
      this.logger.error(
        `[ERROR] Failed to sign in user in Cognito - Email: ${email}`,
        {
          error: error.message,
          code: error.code,
          requestId: error.$metadata?.requestId,
        },
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Customer | null> {
    this.logger.log(`[START] Searching user in Cognito - sub: ${id}`);
    try {
      const result = await this.client.send(
        new ListUsersCommand({
          UserPoolId: this.userPoolId,
          Filter: `sub = "${id}"`,
          Limit: 1,
        }),
      );

      const user = result.Users?.[0];

      if (!user) {
        this.logger.log(`[NOT FOUND] No user found in Cognito with sub: ${id}`);
        return null;
      }

      const subAttr = user.Attributes?.find((a) => a.Name === "sub");
      const nameAttr = user.Attributes?.find((a) => a.Name === "name");
      const emailAttr = user.Attributes?.find((a) => a.Name === "email");

      const customer = new Customer(
        { name: nameAttr?.Value ?? "", email: emailAttr?.Value ?? "" },
        subAttr?.Value!,
      );

      this.logger.log(`[FOUND] Cognito user retrieved - sub: ${customer.id}`);
      return customer;
    } catch (error: any) {
      this.logger.error(`[ERROR] Failed to find user in Cognito - sub: ${id}`, {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }
}
