import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateSaleItemDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do produto é obrigatório" })
  productId: string;

  @IsNumber({}, { message: "A quantidade deve ser numérica" })
  @Min(1, { message: "A quantidade deve ser pelo menos 1" })
  @Type(() => Number)
  quantity: number;

  @IsNumber({}, { message: "O preço deve ser numérico" })
  @Min(0, { message: "O preço não pode ser negativo" })
  @Type(() => Number)
  priceAtPurchase: number;

  @IsNumber({}, { message: "O custo deve ser numérico" })
  @IsOptional()
  @Type(() => Number)
  costAtPurchase?: number;
}

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do cliente é obrigatório" })
  customerId: string;

  @IsString()
  @IsNotEmpty({ message: "O ID do evento é obrigatório" })
  eventId: string;

  @IsArray({ message: "A lista de itens deve ser um array" })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsNumber({}, { message: "O preço total deve ser numérico" })
  @Min(0, { message: "O preço total não pode ser negativo" })
  @Type(() => Number)
  totalPrice: number;

  @IsString()
  @IsOptional()
  status?: "PAGO" | "PENDENTE" | "CANCELADO";

  @IsString()
  @IsOptional()
  operatorId?: string;
}

export class CancelSaleDto {
  @IsString()
  @IsOptional()
  operatorId?: string;
}

export class UpdateSaleStatusDto {
  @IsString()
  @IsNotEmpty({ message: "O status é obrigatório" })
  status: "PAGO" | "PENDENTE" | "CANCELADO";
}
