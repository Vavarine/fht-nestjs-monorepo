import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length, Validate } from "class-validator";

export class LoginBody {
  @ApiProperty({
    example: "12345678901",
    required: false,
    description: "CPF do cliente (opcional para autenticação anônima)",
  })
  @IsString()
  @IsOptional()
  @Length(11, 11)
  cpf?: string;
}
