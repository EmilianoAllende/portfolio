import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateCancellationReasonDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
