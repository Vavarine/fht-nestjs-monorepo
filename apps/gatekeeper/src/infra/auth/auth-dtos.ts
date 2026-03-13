import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginBody {
  @ApiProperty({
    example: "joao@email.com",
    required: true,
    description: "Email do cliente",
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: "12345678",
    required: true,
    description: "Senha do cliente",
  })
  @IsString()
  password: string;
}
