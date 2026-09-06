import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddRepaymentDto {
  @IsNumber({}, { message: "O valor da parcela deve ser numérico" })
  @Min(0.01, { message: "O valor do reembolso deve ser maior que zero" })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  method?: string; // PIX, DINHEIRO, TRANSFERENCIA

  @IsString()
  @IsOptional()
  proofUrl?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
