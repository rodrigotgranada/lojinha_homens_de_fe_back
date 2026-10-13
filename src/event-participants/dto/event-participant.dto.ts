import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";

export class CreateEventParticipantDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(["ACAMPANTE", "TRABALHO"])
  type?: "ACAMPANTE" | "TRABALHO";

  @IsOptional()
  @IsEnum(["CONFIRMADO", "PENDENTE", "CANCELADO"])
  status?: "CONFIRMADO" | "PENDENTE" | "CANCELADO";

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEventParticipantDto {
  @IsOptional()
  @IsEnum(["ACAMPANTE", "TRABALHO"])
  type?: "ACAMPANTE" | "TRABALHO";

  @IsOptional()
  @IsEnum(["CONFIRMADO", "PENDENTE", "CANCELADO"])
  status?: "CONFIRMADO" | "PENDENTE" | "CANCELADO";

  @IsOptional()
  @IsString()
  notes?: string;
}
