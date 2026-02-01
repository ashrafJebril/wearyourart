import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  MinLength,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  customizationPrice?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  colors?: Array<{ name: string; hex: string }>;

  @IsOptional()
  colorImages?: Record<string, string[]>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsUUID()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  subcategoryId?: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsBoolean()
  @IsOptional()
  customizable?: boolean;
}
