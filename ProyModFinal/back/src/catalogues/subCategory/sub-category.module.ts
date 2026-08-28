import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import { Brand } from '../brand/entities/brand.entity';
import { Category } from '../category/entities/category.entity';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TenantTypeOrmModule.forFeature([SubCategory, Category, Brand]),
AuthModule],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
})
export class SubCategoryModule {}
