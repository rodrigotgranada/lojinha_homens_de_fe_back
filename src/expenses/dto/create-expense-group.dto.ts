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

  @IsEnum(["INFRAESTRUTURA", "OPERACIONAL", "LOJINHA_INVESTIMENTO", "LOJINHA_DOACAO"], { message: "Natureza inválida" })
  @IsOptional()
  nature?: "INFRAESTRUTURA" | "OPERACIONAL" | "LOJINHA_INVESTIMENTO" | "LOJINHA_DOACAO";

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;
}
