export abstract class AuthService {
  abstract authenticate(
    cpf?: string
  ): Promise<{ token: string; customerId: string | null }>;
  abstract authorize(token: string): Promise<string | null>;
}
