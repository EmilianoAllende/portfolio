import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateMembershipStatusDto {
  @IsString()
  @IsOptional()
  membership_status?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
