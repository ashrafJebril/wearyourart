import { IsString, IsOptional, MinLength, IsUUID } from 'class-validator';

export class UpdateSubcategoryDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
