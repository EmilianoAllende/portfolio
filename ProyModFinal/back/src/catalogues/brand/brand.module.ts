import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { SubCategory } from '../subCategory/entities/sub-category.entity';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TenantTypeOrmModule.forFeature([Brand, SubCategory]),
AuthModule],
  providers: [BrandService],
  controllers: [BrandController],
})
export class BrandModule {}
