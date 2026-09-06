import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateExpenseItemDto {
  @IsString()
  @IsNotEmpty({ message: "A descrição do item é obrigatória" })
  description: string;

  @IsNumber({}, { message: "O valor deve ser numérico" })
  @Min(0, { message: "O valor não pode ser negativo" })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty({ message: "O pagador/voluntário é obrigatório" })
  paidBy: string;

  @IsString()
  @IsOptional()
  payerPhone?: string;

  @IsBoolean()
  @IsOptional()
  isDonation?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;
}

export class UpdateExpenseItemDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: "O valor deve ser numérico" })
  @Min(0, { message: "O valor não pode ser negativo" })
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  paidBy?: string;

  @IsString()
  @IsOptional()
  payerPhone?: string;

  @IsBoolean()
  @IsOptional()
  isDonation?: boolean;

  @IsString()
  @IsOptional()
  status?: "PENDENTE" | "REEMBOLSADO_PARCIAL" | "REEMBOLSADO" | "DOACAO";

  @IsNumber({}, { message: "O valor reembolsado deve ser numérico" })
  @Min(0, { message: "O valor reembolsado não pode ser negativo" })
  @IsOptional()
  @Type(() => Number)
  repaidAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;
}
