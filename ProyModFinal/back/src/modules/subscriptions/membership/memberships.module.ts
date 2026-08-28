import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { Membership } from './entities/membership.entity';
import { TenantTypeOrmModule } from '../../../common/typeorm-tenant-repository/tenant-repository.provider';

@Module({
  imports: [TenantTypeOrmModule.forFeature([Membership])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
})
export class MembershipsModule {}
