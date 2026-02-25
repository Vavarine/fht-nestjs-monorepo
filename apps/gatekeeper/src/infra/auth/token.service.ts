import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  getCustomerIdFromToken(token: string): string | null {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded.sub; // O sub do JWT é o ID do usuário no Cognito
    } catch {
      return null;
    }
  }
}
