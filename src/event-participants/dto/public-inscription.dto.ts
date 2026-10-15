import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

export class PublicInscriptionDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  eventSlug?: string;

  @IsNotEmpty({ message: "CPF é obrigatório" })
  @IsString()
  cpf: string;

  @IsNotEmpty({ message: "Nome é obrigatório" })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: "Sobrenome é obrigatório" })
  @IsString()
  lastName: string;

  @IsNotEmpty({ message: "Telefone/WhatsApp é obrigatório" })
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  parish?: string;

  @IsNotEmpty({ message: "Tipo de inscrição é obrigatório" })
  @IsEnum(["ACAMPANTE", "TRABALHO"])
  type: "ACAMPANTE" | "TRABALHO";

  // --- Campos ACAMPANTE ---
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  healthRestrictions?: string;

  @IsOptional()
  @IsBoolean()
  lgpdAuthorized?: boolean;

  // --- Campos EQUIPE DE TRABALHO ---
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredRoles?: string[];

  @IsOptional()
  @IsBoolean()
  willGiveTestimony?: boolean;

  @IsOptional()
  @IsString()
  testimonyDetails?: string;

  @IsOptional()
  @IsString()
  testimonyReason?: string;

  @IsOptional()
  @IsString()
  previousHfEdition?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availabilityDays?: string[];

  @IsOptional()
  @IsBoolean()
  hasTent?: boolean;

  @IsOptional()
  @IsBoolean()
  preCampAvailability?: boolean;

  @IsOptional()
  @IsString()
  pastRoles?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedGuestsCount?: number;
}
