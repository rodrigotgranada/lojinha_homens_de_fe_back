import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class ReconciliationItemDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do produto anterior é obrigatório" })
  productId: string;

  @IsNumber({}, { message: "A quantidade a importar deve ser numérica" })
  @Min(0, { message: "A quantidade a importar não pode ser negativa" })
  @Type(() => Number)
  quantityToImport: number;

  @IsNumber({}, { message: "A quantidade a baixar deve ser numérica" })
  @Min(0, { message: "A quantidade a baixar não pode ser negativa" })
  @IsOptional()
  @Type(() => Number)
  writeOffQuantity?: number;

  @IsString()
  @IsOptional()
  writeOffReason?: "PERDA" | "DOACAO" | "AVARIA" | "OUTRO";

  @IsString()
  @IsOptional()
  writeOffNotes?: string;
}

export class ImportPreviousStockDto {
  @IsString()
  @IsNotEmpty({ message: "O ID do evento atual é obrigatório" })
  currentEventId: string;

  @IsString()
  @IsNotEmpty({ message: "O ID do evento anterior é obrigatório" })
  previousEventId: string;

  @IsArray({ message: "A lista de itens deve ser um array" })
  @ValidateNested({ each: true })
  @Type(() => ReconciliationItemDto)
  items: ReconciliationItemDto[];

  @IsString()
  @IsOptional()
  operatorName?: string;
}
