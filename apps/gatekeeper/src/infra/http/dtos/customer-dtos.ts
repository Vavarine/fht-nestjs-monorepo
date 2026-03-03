import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class CreateCustomerBody {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  name: string;

  @ApiProperty({ example: "joao@email.com", required: true })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: "12345678", required: true })
  @IsString()
  @Length(8, Number.MAX_SAFE_INTEGER)
  password: string;
}
