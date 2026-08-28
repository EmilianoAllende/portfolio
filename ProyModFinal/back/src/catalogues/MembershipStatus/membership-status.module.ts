import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipStatus } from './entities/membership-status.entity';
import { MembershipStatusService } from './membership-status.service';
import { MembershipStatusController } from './membership-status.controller';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TenantTypeOrmModule.forFeature([MembershipStatus]),
AuthModule],
  providers: [MembershipStatusService],
  controllers: [MembershipStatusController],
})
export class MembershipStatusModule {}
