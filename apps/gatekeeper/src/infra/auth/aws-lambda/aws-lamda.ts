import { CustomerIdentityRepository } from "@gatekeeper/application/repositories/customer-identity-repository";
import { Injectable } from "@nestjs/common";
import { AuthService } from "apps/gatekeeper/src/application/auth-service/auth-service";

@Injectable()
export class AWSLambdaAuth implements AuthService {
  constructor(
    private readonly customerIdentityRepository: CustomerIdentityRepository,
  ) {}

  async authenticate(
    email: string,
    password: string,
  ): Promise<{ token: string; customerId: string | null }> {
    return await this.customerIdentityRepository.signIn(email, password);
  }

  async authorize(token: string): Promise<string | null> {
    return await this.customerIdentityRepository.validate(token);
  }
}
