import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Validate,
} from "class-validator";

export class CreateCustomerBody {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  name: string;

  @ApiProperty({ example: "joao@email.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "12345678901", required: false })
  @IsString()
  @Length(11, 11)
  cpf: string;
}
