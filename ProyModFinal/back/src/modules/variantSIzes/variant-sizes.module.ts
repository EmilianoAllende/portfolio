import { Module } from '@nestjs/common';
import { VariantSize } from './entities/variantSizes.entity';
import { Size } from 'src/catalogues/sizeProduct/entities/size-product.entity';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';
import { VariantSizesService } from './variant-sizes.service';
import { VariantSizesController } from './variant-sizes.controller';
import { TenantTypeOrmModule } from 'src/common/typeorm-tenant-repository/tenant-repository.provider';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TenantTypeOrmModule.forFeature([VariantSize, Size, ProductVariant]),
    AuthModule,
  ],
  providers: [VariantSizesService],
  controllers: [VariantSizesController],
})
export class VariantSizesModule {}
