import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from './entities/size-product.entity';
import { SizeService } from './size-product.service';
import { SizeController } from './size-product.controller';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TenantTypeOrmModule.forFeature([Size]),
AuthModule],
  controllers: [SizeController],
  providers: [SizeService],
})
export class SizeModule {}
