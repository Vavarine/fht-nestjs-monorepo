export abstract class AuthService {
  abstract authenticate(
    email: string,
    password: string,
  ): Promise<{ token: string; customerId: string | null }>;
  abstract authorize(token: string): Promise<string | null>;
}
