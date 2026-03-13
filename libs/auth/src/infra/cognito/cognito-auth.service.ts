import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Injectable, Logger } from "@nestjs/common";
import { AuthService } from "../../application/auth-service";

@Injectable()
export class CognitoAuthService implements AuthService {
  private readonly logger = new Logger(CognitoAuthService.name);

  private client = new CognitoIdentityProviderClient({
    endpoint: process.env.COGNITO_ENDPOINT_URL,
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async authorize(token: string): Promise<string | null> {
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
}
