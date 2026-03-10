import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./public";
import { Reflector } from "@nestjs/core";
import { AuthService } from "apps/gatekeeper/src/application/auth-service/auth-service";
import { Logger } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private auth: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (isPublic) return true;

    const serviceKey = request.headers["x-internal-api-key"];
    const expectedKey = process.env.INTERNAL_SERVICE_API_KEY;
    if (expectedKey && serviceKey === expectedKey) return true;

    if (!token) {
      this.logger.warn("No token provided in request headers");
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.auth.authorize(token);

      request["customerId"] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
