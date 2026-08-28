import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationService } from './cancellation.service';
import { CancellationController } from './cancellation.controller';
import { Cancellation } from './entities/cancellation.entity';
import { CancellationReasonModule } from '../../catalogues/cancellationReason/cancellation-reason.module';
import { TenantTypeOrmModule } from '../../common/typeorm-tenant-repository/tenant-repository.provider';

@Module({
  imports: [
    TenantTypeOrmModule.forFeature([Cancellation]),
    CancellationReasonModule,
  ],
  controllers: [CancellationController],
  providers: [CancellationService],
  exports: [CancellationService],
})
export class CancellationModule {}
