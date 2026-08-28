import {
  IsString,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateMembershipStatusDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  membership_status: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
