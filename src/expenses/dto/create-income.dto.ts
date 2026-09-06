import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do evento é obrigatório" })
  eventId: string;

  @IsString()
  @IsNotEmpty({ message: "O título da receita é obrigatório" })
  title: string;

  @IsString()
  @IsNotEmpty({ message: "O tipo de receita é obrigatório" })
  type: string;

  @IsNumber({}, { message: "O valor deve ser numérico" })
  @Min(0.01, { message: "O valor arrecadado deve ser positivo" })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;
}
