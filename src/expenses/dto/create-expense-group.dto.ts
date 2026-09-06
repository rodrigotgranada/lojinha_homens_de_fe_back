import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";

export class CreateExpenseGroupDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do evento é obrigatório" })
  eventId: string;

  @IsString()
  @IsNotEmpty({ message: "O título da despesa/obra é obrigatório" })
  title: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(["INFRAESTRUTURA", "OPERACIONAL"], { message: "A natureza deve ser INFRAESTRUTURA ou OPERACIONAL" })
  @IsOptional()
  nature?: "INFRAESTRUTURA" | "OPERACIONAL";

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;
}
