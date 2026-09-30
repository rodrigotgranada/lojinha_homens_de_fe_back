import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: "O nome do produto é obrigatório" })
  name: string;

  @IsNumber({}, { message: "O preço deve ser numérico" })
  @Min(0, { message: "O preço não pode ser negativo" })
  @Type(() => Number)
  price: number;

  @IsNumber({}, { message: "O estoque deve ser numérico" })
  @Min(0, { message: "O estoque não pode ser negativo" })
  @Type(() => Number)
  stock: number;

  @IsNumber({}, { message: "O estoque inicial deve ser numérico" })
  @IsOptional()
  @Type(() => Number)
  initialStock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsNumber({}, { message: "O estoque mínimo deve ser numérico" })
  @IsOptional()
  @Type(() => Number)
  minStock?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber({}, { message: "O preço deve ser numérico" })
  @Min(0, { message: "O preço não pode ser negativo" })
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber({}, { message: "O estoque deve ser numérico" })
  @Min(0, { message: "O estoque não pode ser negativo" })
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsNumber({}, { message: "O estoque inicial deve ser numérico" })
  @IsOptional()
  @Type(() => Number)
  initialStock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsNumber({}, { message: "O estoque mínimo deve ser numérico" })
  @IsOptional()
  @Type(() => Number)
  minStock?: number;
}

export class UpdateStockDto {
  @IsNumber({}, { message: "O estoque deve ser numérico" })
  @Min(0, { message: "O estoque não pode ser negativo" })
  @Type(() => Number)
  stock: number;
}
