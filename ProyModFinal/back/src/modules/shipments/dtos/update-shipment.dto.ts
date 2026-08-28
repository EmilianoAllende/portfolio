import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShipmentDto {
  @ApiPropertyOptional({ example: 'EMB-2025-001' })
  @IsString()
  @IsOptional()
  s_embarque?: string;

  @ApiPropertyOptional({ example: '2025-06-20' })
  @IsDateString()
  @IsOptional()
  d_fecha_embarque?: string;
}
