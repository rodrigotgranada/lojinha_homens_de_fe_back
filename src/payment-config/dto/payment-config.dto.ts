import { IsString, IsOptional, IsBoolean } from "class-validator";

export class CreatePaymentConfigDto {
  @IsString()
  pixKey: string;

  @IsOptional()
  @IsString()
  keyType?: string;

  @IsString()
  merchantName: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentConfigDto {
  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsString()
  keyType?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
