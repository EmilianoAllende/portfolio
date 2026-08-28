import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsNotEmpty, IsString, IsOptional, Min } from 'class-validator';

export class CreateVariantSizeDto {
  @ApiProperty({ example: 'uuid-size' })
  @IsUUID()
  @IsNotEmpty()
  size_id: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Stock must be greater than 0' })
  stock: number;

  @ApiProperty({ example: 'uuid-variant-product' })
  @IsOptional()
  variant_product_id?: string;
}