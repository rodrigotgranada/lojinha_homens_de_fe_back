import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateStockEntryDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do produto é obrigatório" })
  productId: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsNumber({}, { message: "A quantidade deve ser numérica" })
  @Min(1, { message: "A quantidade deve ser de pelo menos 1 unidade" })
  @Type(() => Number)
  quantity: number;

  @IsNumber({}, { message: "O custo unitário deve ser numérico" })
  @Min(0, { message: "O custo unitário não pode ser negativo" })
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;

  @IsNumber({}, { message: "O custo total deve ser numérico" })
  @Min(0, { message: "O custo total não pode ser negativo" })
  @IsOptional()
  @Type(() => Number)
  totalCost?: number;

  @IsString()
  @IsOptional()
  sponsorName?: string;

  @IsString()
  @IsOptional()
  sponsorCpf?: string;

  @IsString()
  @IsOptional()
  sponsorPhone?: string;

  @IsString()
  @IsOptional()
  sponsorUserId?: string;

  @IsBoolean()
  @IsOptional()
  isDonation?: boolean;

  @IsOptional()
  date?: string | Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  operatorName?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
