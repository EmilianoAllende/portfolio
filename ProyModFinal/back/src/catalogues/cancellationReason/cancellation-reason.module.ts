import { forwardRef, Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationReasonService } from './cancellation-reason.service';
import { CancellationReasonController } from './cancellation-reason.controller';
import { CancellationReason } from './entities/cancellation-reason.entity';
import { TenantTypeOrmModule } from '../../common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    TenantTypeOrmModule.forFeature([CancellationReason]),
    forwardRef(() => AuthModule),
  ],
  providers: [CancellationReasonService],
  controllers: [CancellationReasonController],
  exports: [CancellationReasonService],
})
export class CancellationReasonModule {}
