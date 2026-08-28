import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateVariantSizeDto } from "src/modules/variantSIzes/dto/create-variant-sizes.dto";

export class CreateProductVariantDto {
  @ApiProperty({ example: 'Talla 40, color negro' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://miapp.com/images/zapatillas-nike-running.jpg' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @ApiProperty({ example: 'c735b720-84a0-4625-a94e-7f994f1e0a11'  })
  @IsString()
  @IsOptional()
  color_id: string;

  @IsString()
  @IsOptional()
  product_id?: string;

  @ApiProperty({
    type: [CreateVariantSizeDto],
    example: [
      {
        size_id: 'uuid-size',
        stock: 10,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantSizeDto)
  variantSizes: CreateVariantSizeDto[];
}
