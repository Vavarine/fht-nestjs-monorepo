import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "apps/gatekeeper/src/application/auth-service/auth-service";
import { LoginBody } from "../../auth/auth-dtos";
import { Public } from "../../auth/guards/public";

interface LoginResponse {
  access_token: string;
  customerId: string | null;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Autenticar usuário",
    description:
      "Autentica um usuário através do CPF e retorna um token de acesso.",
  })
  @ApiResponse({
    status: 200,
    description: "Usuário autenticado com sucesso",
    schema: {
      type: "object",
      properties: {
        access_token: { type: "string" },
        customerId: { type: "string", nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Falha na autenticação",
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor",
  })
  @Public()
  @Post("login")
  async login(@Body() body: LoginBody): Promise<LoginResponse> {
    try {
      const { token, customerId } = await this.authService.authenticate(
        body.cpf,
      );

      return {
        access_token: token,
        customerId: customerId,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new InternalServerErrorException("Authentication failed");
    }
  }
}
