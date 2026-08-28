import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipTypesService } from './membership-types.service';
import { MembershipTypesController } from './membership-types.controller';
import { MembershipType } from './entities/membershipType.entity';
import { TenantTypeOrmModule } from '../../../common/typeorm-tenant-repository/tenant-repository.provider';

@Module({
  imports: [TenantTypeOrmModule.forFeature([MembershipType])],
  controllers: [MembershipTypesController],
  providers: [MembershipTypesService],
})
export class MembershipTypesModule {}
