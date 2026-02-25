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

@Injectable()
export class AuthGuard implements CanActivate {
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

    if (
      isPublic ||
      process.env.NODE_ENV === "development" ||
      token === process.env.APP_KEY
    )
      return true;

    if (!token) {
      console.log("No token provided");
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
