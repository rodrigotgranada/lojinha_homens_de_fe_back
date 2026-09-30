import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from "class-validator";
import type { EventStatus } from "../../schemas/event.schema";

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(["PROGRAMADO", "ATIVO", "ENCERRADO", "CANCELADO"])
  status?: EventStatus;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(["PROGRAMADO", "ATIVO", "ENCERRADO", "CANCELADO"])
  status?: EventStatus;
}
