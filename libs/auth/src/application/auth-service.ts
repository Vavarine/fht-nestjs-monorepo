export abstract class AuthService {
  abstract authorize(token: string): Promise<string | null>;
}
