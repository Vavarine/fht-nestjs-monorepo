import { Injectable } from "@nestjs/common";
import { AuthService } from "apps/gatekeeper/src/application/auth-service/auth-service";
import { Lambda } from "aws-sdk";

interface LambdaAuthenticateResponse {
  statusCode: number;
  message: string;
  token: string;
  customerId: string | null;
}

interface LambdaAuthorizeResponse {
  statusCode: number;
  valid: boolean;
  message: string;
  customerId: string | null;
}

@Injectable()
export class AWSLambdaAuth implements AuthService {
  async authenticate(
    cpf?: string,
  ): Promise<{ token: string; customerId: string | null }> {
    if (process.env.NODE_ENV === "development") {
      return { token: "dev-token", customerId: null };
    }

    const lambda = new Lambda({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    });

    const params = {
      FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME || "my-service",
      Payload: JSON.stringify({ cpf }),
    };

    const response = await lambda.invoke(params).promise();

    if (response.StatusCode !== 200) {
      console.error("Error invoking Lambda:", response);

      throw new Error("Error invoking Lambda function");
    }

    if (!response.Payload) {
      throw new Error("Invalid response from Lambda function");
    }

    const payload = JSON.parse(
      response.Payload.toString(),
    ) as LambdaAuthenticateResponse;

    if (payload.statusCode !== 200) {
      const errorPayload = JSON.parse(response.Payload.toString());
      console.error("Authentication error", errorPayload);

      throw new Error(errorPayload.body || "Authentication failed");
    }

    return { token: payload.token, customerId: payload.customerId };
  }

  async authorize(token: string): Promise<string | null> {
    const lambda = new Lambda({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    });

    const params = {
      FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME || "my-service",
      Payload: JSON.stringify({ action: "validate", token }),
    };

    const response = await lambda.invoke(params).promise();
    if (response.StatusCode !== 200) {
      console.error("Error invoking Lambda:", response);

      throw new Error("Error invoking Lambda function");
    }

    if (!response.Payload) {
      throw new Error("Invalid response from Lambda function");
    }

    const payload = JSON.parse(
      response.Payload.toString(),
    ) as LambdaAuthorizeResponse;

    return payload.customerId;
  }
}
